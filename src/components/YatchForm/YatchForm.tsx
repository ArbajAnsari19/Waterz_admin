import { useState, FormEvent, useEffect } from 'react';
import styles from '../../styles/YatchForm/YatchForm.module.css';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { GroupBase } from 'react-select';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ownerAPI } from '../../api/owner';

interface LocationOption {
  label: string;
  value: string;
  coordinates: [number, number]; // Tuple type
}



const LOCATIONS: Record<'Goa' | 'Dubai', LocationOption[]> = {
  Goa: [
    { label: "Miramar Beach", value: "miramar", coordinates: [15.4909, 73.8126] },
    { label: "Calangute", value: "calangute", coordinates: [15.5449, 73.7526] },
    { label: "Panjim Marina", value: "panjim", coordinates: [15.4989, 73.8278] },
    { label: "Baga Beach", value: "baga", coordinates: [15.5566, 73.7516] },
    { label: "Dona Paula", value: "donapaula", coordinates: [15.4511, 73.8047] }
  ],
  Dubai: [
    { label: "Dubai Marina", value: "marina", coordinates: [25.0819, 55.1367] },
    { label: "Port Rashid", value: "portrashid", coordinates: [25.2866, 55.2744] },
    { label: "Dubai Creek", value: "creek", coordinates: [25.2048, 55.3271] },
    { label: "Palm Jumeirah", value: "palm", coordinates: [25.1124, 55.1390] },
    { label: "Dubai Harbour", value: "harbour", coordinates: [25.0989, 55.1508] }
  ]
};

// Update the Select component options type:
const locationOptions: GroupBase<LocationOption>[] = [
  { label: "Goa", options: LOCATIONS.Goa },
  { label: "Dubai", options: LOCATIONS.Dubai }
];
interface DimensionsData {
  length: string;
  width: string;
  height: string;
}

interface Location {
  type: "Point";
  coordinates: [number, number];
}

interface Crew {
  name: string;
  role: string;
}

interface YachtFormData {
  name: string;
  pickupat: string;
  location: Location;
  description: string;
  price: {
    sailing: number;
    still: number;
  };
  availability: boolean;
  amenities: string[];
  capacity: number;
  mnfyear?: number;
  dimension?: string;
  crews?: Crew[];
  images: string[];
  YachtType: string;
  dimensions: DimensionsData;
  uniqueFeatures: string;
  availabilityFrom: string;
  availabilityTo: string;
  crewCount: string;
}

const YachtForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.state?.isEdit;
  const yachtId = location.state?.yachtId;

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<{ label: string; value: string; coordinates: [number, number] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize form data state
  const [formData, setFormData] = useState<YachtFormData>({
    name: '',
    pickupat: '',
    location: {
      type: "Point",
      coordinates: [0, 0]
    },
    description: '',
    price: {
      sailing: 0,
      still: 0
    },
    availability: true,
    amenities: [],
    capacity: 0,
    mnfyear: undefined,
    dimension: '',
    crews: [],
    images: [],
    YachtType: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    uniqueFeatures: '',
    availabilityFrom: '',
    availabilityTo: '',
    crewCount: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof YachtFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof YachtFormData, string>> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.name.trim()) {
      newErrors.name = 'Yacht name is required';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Please enter a valid capacity';
    }

    if (!formData.mnfyear) {
      newErrors.mnfyear = 'Manufacturer year is required';
    } else {
      const year = Number(formData.mnfyear);
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.mnfyear = `Please enter a valid year between 1900 and ${currentYear}`;
      }
    }

    if (!formData.pickupat) {
      newErrors.pickupat = 'Pickup location is required';
    }

    if (!formData.YachtType) {
      newErrors.YachtType = 'Category is required';
    }

    if (!formData.crewCount) {
      newErrors.crewCount = 'Number of crew is required';
    } else if (isNaN(Number(formData.crewCount)) || Number(formData.crewCount) < 0) {
      newErrors.crewCount = 'Please enter a valid crew count';
    }

    if (!formData.price.sailing) {
      newErrors.price = 'Sailing price is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationChange = (selected: any) => {
    setSelectedLocation(selected);
    setFormData(prev => ({
      ...prev,
      pickupat: selected.label,
      location: {
        type: "Point",
        coordinates: selected.coordinates
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const files = Array.from(e.target.files);
      
      // Optional: Add file validation
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        return isValidType && isValidSize;
      });

      if (validFiles.length !== files.length) {
        setUploadError('Some files were skipped. Please only upload images under 5MB.');
      }

      const uploadPromises = validFiles.map(file => uploadToCloudinary(file));
      const cloudinaryUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...cloudinaryUrls]
      }));
    } catch (error) {
      console.error('Error handling file upload:', error);
      setUploadError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  // Optional: Add function to remove uploaded images
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };
  const handleDimensionChange = (value: string, dimension: keyof DimensionsData) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      },
      dimension: `${prev.dimensions.length}x${prev.dimensions.width}x${prev.dimensions.height}`
    }));
  };

  const handleStartTimeChange = (time: Date | null) => {
    setStartTime(time);
    setFormData(prev => ({
      ...prev,
      availabilityFrom: time ? time.toISOString() : ''
    }));
  };
  
  const handleEndTimeChange = (time: Date | null) => {
    setEndTime(time);
    setFormData(prev => ({
      ...prev,
      availabilityTo: time ? time.toISOString() : ''
    }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    try {
      const yachtData = {
        ...formData,
        amenities: formData.amenities.length 
          ? formData.amenities 
          : formData.uniqueFeatures.split(',').map(f => f.trim()),
        crews: Array(Number(formData.crewCount))
          .fill(null)
          .map(() => ({ name: '', role: '' })),
        dimension: `${formData.dimensions.length}x${formData.dimensions.width}x${formData.dimensions.height}`,
        availability: startTime && endTime ? true : false,
        price: {
          sailing: Number(formData.price.sailing),
          still: Number(formData.price.still) || 0
        }
      };
  
      // Navigate to review page with yacht data
      navigate('/yatch-review', { 
        state: { 
          yachtData,
          isEdit: isEditMode,
          yachtId: yachtId
        }
      });
  
    } catch (error) {
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create yacht. Please try again.'
      );
    }
  };


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* <div className={styles.yatchBox}>
        <div className={styles.section_head}>List Your Yacht for Charter</div>
        <div className={styles.section_head2}>Showcase your yacht to a global audience by adding details, photos, and availability & start earning today!</div>
      </div> */}
      <div className={styles.formGrid}>
        <div className={styles.left}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name of the Yacht*</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? styles.error : 'input_container'}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity">Capacity*</label>
            <input
              type="number"
              id="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              className={errors.capacity ? styles.error : 'input_container'}
            />
            {errors.capacity && <span className={styles.errorMessage}>{errors.capacity}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="mnfyear">Manufacturer Year*</label>
            <input
              type="number"
              id="mnfyear"
              value={formData.mnfyear}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              className={errors.mnfyear ? styles.error : 'input_container'}
            />
            {errors.mnfyear && <span className={styles.errorMessage}>{errors.mnfyear}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dimensions">Dimensions*</label>
            <div className={styles.input_Box}>
              <div className={styles.date}>
                <input
                  type="number"
                  placeholder="Length"
                  value={formData.dimensions.length}
                  onChange={(e) => handleDimensionChange(e.target.value, 'length')}
                  className={errors.dimensions ? styles.error : 'input_container'}
                />
              </div>
              <div className={styles.date}>
                <input
                  type="number"
                  placeholder="Width"
                  value={formData.dimensions.width}
                  onChange={(e) => handleDimensionChange(e.target.value, 'width')}
                  className={errors.dimensions ? styles.error : 'input_container'}
                />
              </div>
              <div className={styles.date}>
                <input
                  type="number"
                  placeholder="Height"
                  value={formData.dimensions.height}
                  onChange={(e) => handleDimensionChange(e.target.value, 'height')}
                  className={errors.dimensions ? styles.error : 'input_container'}
                />
              </div>
            </div>
            {errors.dimensions && <span className={styles.errorMessage}>{errors.dimensions}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Pickup Location*</label>
            <Select
              options={locationOptions}
              value={selectedLocation}
              onChange={handleLocationChange}
              className={styles.locationSelect}
            />
            {errors.pickupat && <span className={styles.errorMessage}>{errors.pickupat}</span>}
          </div>
        </div>

        <div className={styles.right}>
          {/* <div className={styles.formGroup}>
            <label htmlFor="photos">Add Photos or Videos*</label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </div>
          </div> */}
          <div className={styles.formGroup}>
            <label htmlFor="photos">Add Photos or Videos*</label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                id="photos"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && <div className={styles.uploadingStatus}>Uploading...</div>}
              {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}
            </div>
            
            {/* Preview uploaded images */}
            <div className={styles.imagePreview}>
              {formData.images.map((url, index) => (
                <div key={url} className={styles.previewItem}>
                  <img src={url} alt={`Upload ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="YachtType">Category*</label>
            <select
              id="YachtType"
              value={formData.YachtType}
              onChange={handleInputChange}
              className={errors.YachtType ? styles.error : 'input_container'}
            >
              <option value="">Select category</option>
              <option value="luxury">Luxury</option>
              <option value="sport">Sport</option>
              <option value="fishing">Fishing</option>
              <option value="sailing">Sailing</option>
            </select>
            {errors.YachtType && <span className={styles.errorMessage}>{errors.YachtType}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="crewCount">No. of Crew*</label>
            <input
              type="number"
              id="crewCount"
              value={formData.crewCount}
              onChange={handleInputChange}
              min="0"
              className={errors.crewCount ? styles.error : 'input_container'}
            />
            {errors.crewCount && <span className={styles.errorMessage}>{errors.crewCount}</span>}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="uniqueFeatures">Unique Features</label>
        <textarea
          id="uniqueFeatures"
          value={formData.uniqueFeatures}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.dateRange}>
        <div className={styles.formGroup}>
          <label htmlFor="availabilityFrom">Mention Availability*</label>
          <div className={styles.input_Box}>
            <div className={styles.date}>
              <DatePicker
                selected={startTime}
                onChange={handleStartTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className={styles.date_picker}
              />
            </div>
            <div className={styles.date}>
              <DatePicker
                selected={endTime}
                onChange={handleEndTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className={styles.date_picker}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.priceGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="sailingPrice">Price per hour*</label>
          <div className={styles.input_Box}>
            <div className={styles.date}>
              <NumericFormat
                thousandSeparator
                prefix="₹"
                id="sailingPrice"
                value={formData.price.sailing}
                onValueChange={(values) => {
                  setFormData(prev => ({
                    ...prev,
                    price: {
                      ...prev.price,
                      sailing: Number(values.value)
                    }
                  }));
                }}
                className={errors.price ? styles.error : 'input_container'}
              />
            </div>
            <div className={styles.date}>
              <NumericFormat
                thousandSeparator
                prefix="₹"
                id="stillPrice"
                value={formData.price.still}
                onValueChange={(values) => {
                  setFormData(prev => ({
                    ...prev,
                    price: {
                      ...prev.price,
                      still: Number(values.value)
                    }
                  }));
                }}
                className={errors.price ? styles.error : 'input_container'}
              />
            </div>
          </div>
          {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
        </div>
      </div>

      <div className={styles.formGroup + ' ' + styles.fullWidth}>
        <label htmlFor="description">Write a Brief about your Yacht*</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          className={errors.description ? styles.error : 'input_container'}
        />
        {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
      </div>

      {submitError && (
        <div className={styles.errorMessage}>
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className={styles.successMessage}>
          Yacht created successfully!
        </div>
      )}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Confirm & Continue'}
      </button>
    </form>
  );
};

export default YachtForm;

