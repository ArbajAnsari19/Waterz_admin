import React, { useState } from "react";
import Select, { SingleValue, MultiValue } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/Booking/BookingDetails.module.css";
import Y2 from "../../assets/Yatch/Y2.svg";
import { yachtAPI } from '../../api/yachts';
import { useLocation, useNavigate } from "react-router-dom";

// Interface for select option type
interface SelectOption {
    value: string;
    label: string;
}

interface TimeSelectOption {
    value: number;
    label: string;
}

// Interface for form data
interface FormData {
    startDate: Date | null;
    startTime: Date | null;
    duration: number | null;
    location: SelectOption | null;
    specialRequest: string;
    PeopleNo: number;
    specialEvent: SelectOption | null;
    sailingTime: number | null;
    stillTime: number | null;
    user: string;
    yacht: string;
}

const priceRanges: TimeSelectOption[] = [
    { value: 1, label: "1 hours" },
    { value: 2, label: "2 hours" },
    { value: 5, label: "5 hours" },
    { value: 6, label: "6 hours" },
];

const pickupPoints: SelectOption[] = [
    { value: "Miami", label: "Dubai Marina" },
    { value: "marina2", label: "Palm Jumeirah" },
    { value: "marina3", label: "Dubai Harbour" },
    { value: "marina4", label: "Port Rashid" },
];

const TripDuration: TimeSelectOption[] = [
    { value: 4, label: "Hourly Charter" },
    { value: 6, label: "Half Day" },
    { value: 8, label: "Full Day" },
    { value: 12, label: "Overnight" },
];

const specialEvents: SelectOption[] = [
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "corporate", label: "Corporate Event" },
    { value: "party", label: "Party" },
];

const BookingDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { yachtId, yachtName, yacht } = location.state || {};

    const [formData, setFormData] = useState<FormData>({
        startDate: new Date(),
        startTime: new Date(),
        duration: null,
        location: null,
        specialRequest: "",
        PeopleNo: 0,
        specialEvent: null,
        sailingTime: null,
        stillTime: null,
        user: "67804200f812512075e49d7d",
        yacht: yachtId || "",
    });

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            minHeight: "40px",
            backgroundColor: "#f5f5f5",
            border: "none",
            borderRadius: "8px",
            boxShadow: "none",
            padding: "7px",
            fontSize: "18px"
        }),
    };

    const handleSingleSelect = (
        value: SingleValue<SelectOption>,
        field: keyof FormData
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleTimeSelect = (
        value: SingleValue<TimeSelectOption>,
        field: 'duration' | 'sailingTime' | 'stillTime'
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value ? value.value : null,
        }));
    };

    const handleSubmit = async () => {
        try {
            const formattedDate = formData.startDate ? formData.startDate.toISOString().split('T')[0] : "";
            const hours = formData.startTime ? formData.startTime.getHours().toString().padStart(2, '0') : "";
            const minutes = formData.startTime ? formData.startTime.getMinutes().toString().padStart(2, '0') : "";
            const formattedTime = `${hours}:${minutes}`;

            const formattedData = {
                startDate: formattedDate,
                startTime: formattedTime,
                duration: formData.duration || 0,
                location: formData.location?.value || "",
                specialRequest: formData.specialRequest,
                PeopleNo: formData.PeopleNo,
                specialEvent: formData.specialEvent?.value || "",
                sailingTime: formData.sailingTime || 0,
                stillTime: formData.stillTime || 0,
                user: formData.user,
                yacht: formData.yacht
            };
// @ts-ignore
            const response = await yachtAPI.bookYacht(formattedData);
            if (response) {
                navigate('/to-pay', {
                    state: {
// @ts-ignore
                        bookingDetails: response.booking,
// @ts-ignore
                        orderId: response.orderId
                    }
                });
            }
        } catch (error) {
            console.error('Booking failed:', error);
        }
    };

    return (
        <div className={styles.comp_body}>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>Step Closer to Your Yacht Adventure</div>
                <div className={styles.section_head2}>Complete your booking in just a few clicks & get ready for an unforgettable experience!</div>
            </div>
            <div className={styles.image_box}>
                <img src={yacht?.images?.[0] || Y2} alt="Yacht" className={styles.Y2} />
            </div>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>{yachtName || "Luxury Yacht"}</div>
                <div className={styles.section_head2}>Please mention or edit the details to process</div>
            </div>
            <div className={styles.location_filt_box}>
                <div className={styles.form_grid}>
                    {/* Date Picker */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Start Date*</label>
                        <DatePicker
                            selected={formData.startDate}
                            onChange={(date: Date | null) => setFormData(prev => ({
                                ...prev,
                                startDate: date
                            }))}
                            minDate={new Date()}
                            className={styles.date_picker}
                            dateFormat="MM/dd/yyyy"
                        />
                    </div>

                    {/* Time Picker */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Start Time*</label>
                        <DatePicker
                            selected={formData.startTime}
                            onChange={(time: Date | null) => setFormData(prev => ({
                                ...prev,
                                startTime: time
                            }))}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className={styles.date_picker}
                        />
                    </div>

                    {/* Trip Duration */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Trip Duration*</label>
                        <Select
                            options={TripDuration}
                            styles={selectStyles}
                            value={TripDuration.find(option => option.value === formData.duration) || null}
                            onChange={(value) => handleTimeSelect(value as SingleValue<TimeSelectOption>, 'duration')}
                        />
                    </div>

                    {/* Pickup Point */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Pickup Point*</label>
                        <Select
                            options={pickupPoints}
                            styles={selectStyles}
                            value={formData.location}
                            onChange={(value) => handleSingleSelect(value, 'location')}
                        />
                    </div>

                    {/* Number of People Input */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Number of People*</label>
                        <input
                            type="number"
                            min="1"
                            className={styles.form_input}
                            placeholder="Enter number of people"
                            value={formData.PeopleNo}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                PeopleNo: parseInt(e.target.value) || 0
                            }))}
                        />
                    </div>

                    {/* Sailing Time */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Sailing Time*</label>
                        <Select
                            options={priceRanges}
                            styles={selectStyles}
                            value={priceRanges.find(option => option.value === formData.sailingTime) || null}
                            onChange={(value) => handleTimeSelect(value as SingleValue<TimeSelectOption>, 'sailingTime')}
                        />
                    </div>

                    {/* Still Time */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Still Time*</label>
                        <Select
                            options={priceRanges}
                            styles={selectStyles}
                            value={priceRanges.find(option => option.value === formData.stillTime) || null}
                            onChange={(value) => handleTimeSelect(value as SingleValue<TimeSelectOption>, 'stillTime')}
                        />
                    </div>

                    {/* Special Events */}
                    <div className={styles.form_group}>
                        <label className={styles.form_label}>Special Events</label>
                        <Select
                            options={specialEvents}
                            styles={selectStyles}
                            value={formData.specialEvent}
                            onChange={(value) => handleSingleSelect(value, 'specialEvent')}
                        />
                    </div>

                    {/* Special Requests */}
                    <div className={`${styles.form_group} ${styles.special_requests}`}>
                        <label className={styles.form_label}>Special Requests</label>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder="Enter any special requests or requirements"
                            value={formData.specialRequest}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                specialRequest: e.target.value
                            }))}
                        />
                    </div>
                </div>
                <button onClick={handleSubmit} className={styles.submit_button}>
                    Confirm & Continue
                </button>
            </div>
        </div>
    );
};

export default BookingDetails;

// import React, { useState } from "react";
// import Select, { SingleValue, MultiValue } from "react-select";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import styles from "../../styles/Booking/BookingDetails.module.css";
// import Y2 from "../../assets/Yatch/Y2.svg";
// import { Link } from "react-router-dom";
// import { yachtAPI } from '../../api/yachts';
// import { useLocation, useNavigate } from "react-router-dom";
// // Interface for select option type
// interface SelectOption {
//   value: string;
//   label: string;
// }

// // Interface for form data
// interface FormData {
//   startDate: Date | null;
//   startTime: Date | null;
//   duration: string;
//   location: string;
//   specialRequest: string;
//   PeopleNo: string;
//   specialEvent: string;
//   sailingTime: string;
//   stillTime: string;
//   user: string;
//   yacht: string;
// }

// const priceRanges: SelectOption[] = [
//   { value: "0-1", label: "0 - 1 hours" },
//   { value: "1-2", label: "1 - 2 hours" },
//   { value: "2-5", label: "2 - 5 hours" },
//   { value: "5+", label: "5+ hours" },
// ];

// const pickupPoints: SelectOption[] = [
//   { value: "marina1", label: "Dubai Marina" },
//   { value: "marina2", label: "Palm Jumeirah" },
//   { value: "marina3", label: "Dubai Harbour" },
//   { value: "marina4", label: "Port Rashid" },
// ];

// const tripTypes: SelectOption[] = [
//   { value: "hourly", label: "0 - 1 hours" },
//   { value: "halfday", label: "1 - 2 hours" },
//   { value: "fullday", label: "2 - 5 hours" },
//   { value: "overnight", label: "5+ hours" },
// ];
// const TripDuration: SelectOption[] = [
//     { value: "hourly", label: "Hourly Charter" },
//     { value: "halfday", label: "Half Day" },
//     { value: "fullday", label: "Full Day" },
//     { value: "overnight", label: "Overnight" },
//   ];

// const additionalServices: SelectOption[] = [
//   { value: "catering", label: "Birthday" },
//   { value: "watersports", label: "Anniversary" },
//   { value: "crew", label: "Birthday" },
//   { value: "decoration", label: "Anniversary" },
// ];

// const BookingDetails: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { yachtId } = location.state || {};   
//   const [formData, setFormData] = useState<FormData>({
//     startDate: new Date(),
//     startTime: new Date(),
//     duration: "",
//     location: "",
//     specialRequest: "",
//     PeopleNo: "",
//     specialEvent: "",
//     sailingTime: "",
//     stillTime: "",
//     user: "67804200f812512075e49d7d", // Hardcoded user ID
//     yacht: yachtId || "",
//   });

//   // Get today's date for minimum date restriction
//   const today = new Date();

//   // Custom styles for react-select
//   const selectStyles = {
//     control: (base: any) => ({
//       ...base,
//       minHeight: "40px",
//       backgroundColor: "#f5f5f5",
//       border: "none",
//       borderRadius: "8px",
//       boxShadow: "none",
//       padding: "7px",
//       fontSize: "18px"
//     }),
//   };

//   // Handlers with proper typing
//   const handleSingleSelect = (
//     value: SingleValue<SelectOption>,
//     field: keyof FormData
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleMultiSelect = (
//     value: MultiValue<SelectOption>,
//     field: keyof FormData
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value as SelectOption[],
//     }));
//   };

//   const handleSubmit = async () => {
//     try {
//       const formattedData = {
//         ...formData,
//         startDate: formData.startDate?.toISOString() || "",
//         startTime: formData.startTime?.toISOString() || "",
//         duration: formData.duration,
//         location: formData.location,
//         specialRequest: formData.specialRequests,
//         PeopleNo: formData.numberOfPeople,
//         specialEvent: formData.additionalServices?.[0]?.value || "",
//         sailingTime: formData.priceRange?.value || "",
//         stillTime: formData.tripType?.value || "",
//         user: "67804200f812512075e49d7d",
//         yacht: yachtId
//       };
  
//       const response = await yachtAPI.bookYacht(formattedData);
//       if (response) {
//         navigate('/to-pay', { 
//           state: { 
//             bookingDetails: response.booking,
//             orderId: response.orderId 
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Booking failed:', error);
//     }
//   };

// const yachtDetails = {
//     name: "Luxury Yacht",
//     description:
//         "The Luxury Yacht is one of the most popular choices at the Gateway of India. It's refined, well-crafted, and reserved for groups, offering an opulent private sailing experience. Whether your journey starts at Mumbai Harbour or connects with nature, it's unforgettable while embracing the sea breeze. Whether relaxing on the spacious deck or dipping your legs into the water while you sail, enjoy your group, charming views, and the serene ocean that makes everyone smile. Happy Sailing! 😊",
//     summary: {
//         idealFor: "Friends, Family, Couples, Groups, Tourists",
//         For: "6 people",
//         location: "Gateway of India, Mumbai and Goa",
//         duration: "According to preference",
//         note: "This is an exclusive private sailing experience where the entire yacht is reserved just for you—whether you are a couple or a group of five, the price remains the same.",
//     },
//     specifications: {
//         length: "65 feet",
//         capacity: "10-15 people",
//         crew: "3",
//     },
//     meetingPoint: "XYZ beach, Goa, India",
//     sailingPrice: "₹4,000 per hour",
//     stillPrice: "₹3,000 per hour",
// };

//   return (
//     <div className={styles.comp_body}>
//         <div className={styles.yatchBox}>
//             <div className={styles.section_head}>Step Closer to Your Yacht Adventure</div>
//             <div className={styles.section_head2}>Complete your booking in just a few clicks & get ready for an unforgettable experience!</div>
//         </div>
//         <div className={styles.image_box}>
//             <img src={Y2} alt="Yacht" className={styles.Y2} />
//         </div>
//         <div className={styles.yatchBox}>
//             <div className={styles.section_head}>{yachtDetails.name}</div>
//             <div className={styles.section_head2}>Please mention or edit the details to process</div>
//         </div>
//         <div className={styles.location_filt_box}>
//           <div className={styles.form_grid}>
//             {/* Date Picker */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Start Date*</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 minDate={today}
//                 className={styles.date_picker}
//                 dateFormat="MM/dd/yyyy"
//               />
//             </div>
  
//             {/* Time Picker */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Start Time*</label>
//               <DatePicker
//                 selected={startTime}
//                 onChange={(time) => setStartTime(time)}
//                 showTimeSelect
//                 showTimeSelectOnly
//                 timeIntervals={30}
//                 timeCaption="Time"
//                 dateFormat="h:mm aa"
//                 className={styles.date_picker}
//               />
//             </div>
  
//             {/* Trip Duration */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Trip Duration*</label>
//               <Select
//                 options={TripDuration}
//                 styles={selectStyles}
//                 value={formData.duration}
//                 onChange={(value) => handleSingleSelect(value, 'duration')}
//               />
//             </div>
  
//             {/* Pickup Point */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Pickup Point*</label>
//               <Select
//                 options={pickupPoints}
//                 styles={selectStyles}
//                 value={formData.location}
//                 onChange={(value) => handleSingleSelect(value, 'location')}
//               />
//             </div>
  
  
//             {/* Number of People Input */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Number of People*</label>
//               <input
//                 type="number"
//                 min="1"
//                 className={styles.form_input}
//                 placeholder="Enter number of people"
//                 value={formData.PeopleNo}
//                 onChange={(e) => setFormData(prev => ({
//                   ...prev,
//                   PeopleNo: e.target.value
//                 }))}
//               />
//             </div>
  
//             {/* Price Range */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Sailing Time*</label>
//               <Select
//                 options={priceRanges}
//                 styles={selectStyles}
//                 value={formData.priceRange}
//                 onChange={(value) => handleSingleSelect(value, 'priceRange')}
//               />
//             </div>
  
//             {/* Trip Duration */}
//             <div className={styles.form_group}>
//               <label className={styles.form_label}>Still Time*</label>
//               <Select
//                 options={tripTypes}
//                 styles={selectStyles}
//                 value={formData.tripType}
//                 onChange={(value) => handleSingleSelect(value, 'tripType')}
//               />
//             </div>
  
//             {/* Additional Services */}
//             <div className={`${styles.form_group}`}>
//               <label className={styles.form_label}>Special events celebration</label>
//               <Select
//                 options={additionalServices}
//                 styles={selectStyles}
//                 isMulti
//                 value={formData.additionalServices}
//                 onChange={(value) => handleMultiSelect(value, 'additionalServices')}
//               />
//             </div>
  
//             {/* Special Requests */}
//             <div className={`${styles.form_group} ${styles.special_requests}`}>
//               <label className={styles.form_label}>Special Requests</label>
//               <textarea
//                 className={styles.textarea}
//                 rows={3}
//                 placeholder="Enter any special requests or requirements"
//                 value={formData.specialRequests}
//                 onChange={(e) =>
//                   setFormData(prev => ({
//                     ...prev,
//                     specialRequests: e.target.value
//                   }))
//                 }
//               />
//             </div>
//           </div>
//           <Link to="/choose" style={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center"}} >
//               <button onClick={handleSubmit} className={styles.submit_button}>
//                 Confirm & Continue
//               </button>
//           </Link>
//         </div>
//     </div>
//   );
// };

// export default BookingDetails;