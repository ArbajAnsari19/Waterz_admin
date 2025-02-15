import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Agent/AgentForm.module.css';
import { authAPI } from '../../api/auth';
import { uploadToCloudinary } from '../../utils/cloudinary';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  agreeToTerms: boolean;
}

interface SignupResponse {
  message: string;
  redirect: string;
  token: string;
}

interface RegistrationData {
  dateOfBirth: string;
  personalAddress: string;
  username: string;
  experience: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  commission: string;
  imgUrl: string;
}

const SuperAgentSignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'signup' | 'registration'>('signup');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string>('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupToken, setSignupToken] = useState<string>('');

  // First step form data
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'super-agent',
    agreeToTerms: true
  });

  // Second step form data
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    dateOfBirth: '',
    personalAddress: '',
    username: '',
    experience: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    commission: '',
    imgUrl: ''
  });

  const validateSignupData = () => {
    if (!signupData.name.trim()) return 'Name is required';
    if (!signupData.email.trim()) return 'Email is required';
    if (!signupData.phone.trim()) return 'Phone number is required';
    if (!signupData.password.trim()) return 'Password is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      return 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(signupData.phone)) {
      return 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (signupData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return null;
  };

  const validateRegistrationData = () => {
    if (!registrationData.dateOfBirth) return 'Date of birth is required';
    if (!registrationData.personalAddress.trim()) return 'Personal address is required';
    if (!registrationData.username.trim()) return 'Username is required';
    if (!registrationData.experience) return 'Experience is required';
    if (!registrationData.accountHolderName.trim()) return 'Account holder name is required';
    if (!registrationData.accountNumber.trim()) return 'Account number is required';
    if (!registrationData.bankName.trim()) return 'Bank name is required';
    if (!registrationData.ifscCode.trim()) return 'IFSC code is required';
    if (!registrationData.commission) return 'Commission is required';
    if (!registrationData.imgUrl) return 'Profile picture is required';

    return null;
  };

  const handleSignup = async () => {
    const validationError = validateSignupData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt signup and get response with token
      const response: SignupResponse = await authAPI.signupSuperAgent(signupData);
      setSignupToken(response.token);
      setShowOtpField(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authAPI.verifyOTP({ 
        otp: parseInt(otp),
        token: signupToken,
        role:"super-agent"
      });
      setSignupComplete(true);
      setCurrentStep('registration');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const file = e.target.files[0];
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType || !isValidSize) {
        setUploadError('Please upload an image file under 5MB.');
        return;
      }

      const imageUrl = await uploadToCloudinary(file);
      setRegistrationData(prev => ({ ...prev, imgUrl: imageUrl }));
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupComplete) {
      setError('Please complete signup and OTP verification first');
      return;
    }

    const validationError = validateRegistrationData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.registerSuperAgent(registrationData);
      navigate(`/super-agent-profile/${response._id}`, { state: { agent: response } });
    } catch (err: any) {
      setError(err.message || 'Failed to register super agent');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'signup') {
    return (
      <div className={styles.form}>
        <div className={styles.yatchBox}>
          <div className={styles.section_head}>Super Agent Sign Up</div>
          <div className={styles.section_head2}>Create your super agent account</div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.left}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                disabled={showOtpField}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address*</label>
              <input
                type="email"
                id="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                disabled={showOtpField}
              />
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number*</label>
              <input
                type="tel"
                id="phone"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                disabled={showOtpField}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password*</label>
              <input
                type="password"
                id="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                disabled={showOtpField}
              />
            </div>
          </div>
        </div>

        <div className={styles.otpSection}>
          {!showOtpField ? (
            <button 
              type="button" 
              onClick={handleSignup}
              className={styles.otpButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          ) : (
            <div className={styles.otpContainer}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.otpInput}
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={handleVerifyOTP}
                className={styles.otpButton}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleRegistrationSubmit}>
      <div className={styles.yatchBox}>
        <div className={styles.section_head}>Complete Your Profile</div>
        <div className={styles.section_head2}>Provide additional details to complete registration</div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.left}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username*</label>
            <input
              type="text"
              id="username"
              value={registrationData.username}
              onChange={(e) => setRegistrationData({ ...registrationData, username: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateOfBirth">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              value={registrationData.dateOfBirth}
              onChange={(e) => setRegistrationData({ ...registrationData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="experience">Experience (in years)*</label>
            <input
              type="number"
              id="experience"
              value={registrationData.experience}
              onChange={(e) => setRegistrationData({ ...registrationData, experience: e.target.value })}
              min="0"
            />
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.formGroup}>
            <label htmlFor="photo">Profile Picture*</label>
            <div className={styles.fileUpload}>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && <div className={styles.uploadingStatus}>Uploading...</div>}
              {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}
            </div>
            {registrationData.imgUrl && (
              <div className={styles.imagePreview}>
                <img src={registrationData.imgUrl} alt="Profile" />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="personalAddress">Personal Address*</label>
            <textarea
              id="personalAddress"
              value={registrationData.personalAddress}
              onChange={(e) => setRegistrationData({ ...registrationData, personalAddress: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="commission">Commission Percentage*</label>
            <input
              type="number"
              id="commission"
              value={registrationData.commission}
              onChange={(e) => setRegistrationData({ ...registrationData, commission: e.target.value })}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className={styles.bankDetails}>
        <h2>Bank Details</h2>
        <div className={styles.bankGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="accountHolderName">Account Holder Name*</label>
            <input
              type="text"
              id="accountHolderName"
              value={registrationData.accountHolderName}
              onChange={(e) => setRegistrationData({ ...registrationData, accountHolderName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountNumber">Account Number*</label>
            <input
              type="text"
              id="accountNumber"
              value={registrationData.accountNumber}
              onChange={(e) => setRegistrationData({ ...registrationData, accountNumber: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bankName">Bank Name*</label>
            <input
              type="text"
              id="bankName"
              value={registrationData.bankName}
              onChange={(e) => setRegistrationData({ ...registrationData, bankName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ifscCode">IFSC Code*</label>
            <input
              type="text"
              id="ifscCode"
              value={registrationData.ifscCode}
              onChange={(e) => setRegistrationData({ ...registrationData, ifscCode: e.target.value })}
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isLoading || isUploading}
      >
        {isLoading ? 'Registering...' : 'Register Agent'}
      </button>
    </form>
  );
};

export default SuperAgentSignupForm;

