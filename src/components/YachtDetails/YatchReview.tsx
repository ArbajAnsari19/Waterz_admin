import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/YachtDetails/YachtDetails.module.css";
import Y2 from "../../assets/Yatch/Y2.svg";
import { yachtAPI } from "../../api/yachts";
import { ownerAPI } from "../../api/owner";

const Review: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { yachtData, isEdit, yachtId } = location.state || {};
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Static data structure with dynamic values where available
    const yachtDetails = {
        name: yachtData?.name || "Luxury Yacht",
        description: yachtData?.description || "The Luxury Yacht is one of the most popular choices...",
        summary: {
            idealFor: "Friends, Family, Couples, Groups, Tourists",
            For: `${yachtData?.capacity || 6} people`,
            location: yachtData?.pickupat || "Gateway of India, Mumbai and Goa",
            duration: "According to preference",
            note: "This is an exclusive private sailing experience..."
        },
        specifications: {
            length: yachtData?.dimensions?.length || "65 feet",
            capacity: `${yachtData?.capacity || "10-15"} people`,
            crew: yachtData?.crewCount || "3"
        },
        meetingPoint: yachtData?.pickupat || "XYZ beach, Goa, India",
        sailingPrice: `₹${yachtData?.price?.sailing?.toLocaleString() || "4,000"} per hour`,
        stillPrice: `₹${yachtData?.price?.still?.toLocaleString() || "3,000"} per hour`
    };

    const handleEditYacht = () => {
        navigate('/yatch-form', {
            state: {
                isEdit: true,
                yachtId: yachtId
            }
        });
    };

    const handleCharterYacht = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEdit && yachtId) {
                // Update existing yacht
                await ownerAPI.updateYacht(yachtId, yachtData);
            } else {
                // Create new yacht
                await yachtAPI.createYacht(yachtData);
            }
            // Navigate to success page
            navigate('/my-bookings');
        } catch (error) {
            console.error('Failed to process yacht:', error);
            setError('Failed to process yacht. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.comp_body}>
            {error && (
                // <Alert variant="destructive" className="mb-4">
                //     <AlertDescription>{error}</AlertDescription>
                // </Alert>
                <div>{error}</div>
            )}
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>{yachtDetails.name}</div>
                <div className={styles.section_head2}>Explore options to craft a unique yachting experience. </div>
            </div>
            <div className={styles.image_box}>
                <img src={yachtData?.images?.[0] || Y2} alt="Yacht" className={styles.Y2} />
            </div>
            <div className={styles.yacht_details_box}>
                <div className={styles.details}>
                    <div className={styles.prices}>
                        <div className={styles.left}>
                            <div className={styles.price_head}>Prices</div>
                            <div className={styles.price_box}>
                                <div className={styles.pricess}>
                                    <div className={styles.price_type}>Sailing Price</div>
                                    <div className={styles.price_value}>{yachtDetails.sailingPrice}</div>
                                </div>
                                <div className={styles.pricess2}>
                                    <div className={styles.price_type}>Still Price</div>
                                    <div className={styles.price_value}>{yachtDetails.stillPrice}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.Right2}>
                            <button 
                                className={styles.bookButton} 
                                onClick={handleCharterYacht}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : (isEdit ? 'Update Yacht' : 'Charter Yacht')}
                            </button>
                            {isEdit && (
                                <button 
                                    className={styles.bookButton}
                                    onClick={handleEditYacht}
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>  
                    </div>
                    <div className={styles.about}>
                        <h3>About {yachtDetails.name}</h3>
                        <p>{yachtDetails.description}</p>
                    </div>
                    <div className={styles.summary}>
                        <h3>Summary</h3>
                        <p><b>Ideal for:</b> {yachtDetails.summary.idealFor}</p>
                        <p><b>For:</b> {yachtDetails.summary.For}</p>
                        <p><b>Where:</b> {yachtDetails.summary.location}</p>
                        <p><b>Duration:</b> {yachtDetails.summary.duration}</p>
                        <p><b>Note:</b> {yachtDetails.summary.note}</p>
                    </div>
                    <div className={styles.schedule}>
                        <h3>Sailing Schedule</h3>
                        <ul>
                            <li>
                                <b>15 Minutes:</b> Arrive at the designated starting point as per location as instructed by the
                                captain. Safety instructions prior to departure.
                            </li>
                            <li>
                                <b>15 Minutes:</b> The yacht journey is anchored away from the shore. You’ll be taken to a serene
                                natural spot.
                            </li>
                            <li>
                                <b>15 Minutes:</b> Conclude your journey with a scenic return yacht ride back to the shore.
                            </li>
                        </ul>
                    </div>
                    <div className={styles.specifications}>
                        <h3>Specifications</h3>
                        <p><b>Length:</b> {yachtDetails.specifications.length}</p>
                        <p><b>Passenger Capacity:</b> {yachtDetails.specifications.capacity}</p>
                        <p><b>Crew:</b> {yachtDetails.specifications.crew}</p>
                    </div>
                    <div className={styles.meetingPoint}>
                        <h3>Meeting Point Address</h3>
                        <p>{yachtDetails.meetingPoint}</p>
                    </div>
                    <div className={styles.guidelines}>
                        <h3>Important Guidelines</h3>
                        <ul>
                            <li><b>Swimming Not Required:</b> Life jackets are provided, so swimming skills are not mandatory.</li>
                            <li><b>Weather Preparedness:</b> Sailing depends on wind, tides, and clear conditions, which may cause slight schedule and route changes.</li>
                            <li><b>Advisory Cancellations:</b> Trips from Gateway of India can be canceled by authorities; pre-payment is refundable or re-scheduled.</li>
                            <li><b>Stop Policy:</b> Wind-up time is included in your tour time.</li>
                            <li><b>Respect Policy:</b> Weather changes during the trip may need your cooperation.</li>
                        </ul>
                    </div>
                    <div className={styles.faqs}>
                        <h3>FAQs</h3>
                        <p><b>Do you provide catering or food on the boat?</b><br />No, we provide snacks and soft drinks without other personal requests. You are allowed to carry your own food and soft drinks or water. (We recommend sweet yogurt as a complimentary by Goa).</p>
                        <p><b>Can I add decorations like balloons, or cake on board?</b><br />Yes. All private yacht decorations can be directly availed.</p>
                        <p><b>Can you make special arrangements for birthdays/anniversaries?</b><br />Yes. We have an optional arrangement service. Make sure you confirm answers early by contacting our staff.</p>
                        <p><b>Is it a fixed location tour and will I describe the tour on my own?</b><br />Yes. It is included and can be based on healthy weather discovery material that you may want to try!</p>
                    </div>
                    <div className={styles.cancellation}>
                        <h3>Cancellation & Refund Policy</h3>
                        <p><b>Private Cancellations:</b> A refund is allowed if the booking is canceled due to unforeseeable weather, technical issues, or security protocols.</p>
                        <p><b>Customer Cancellations:</b> No refunds will be provided for cancellations made by the customer.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;



// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import styles from "../../styles/YachtDetails/YachtDetails.module.css";
// import Y2 from "../../assets/Yatch/Y2.svg";
// import { yachtAPI } from "../../api/yachts";


// const Review: React.FC = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { yachtData } = location.state || {};

//     // Static data structure with dynamic values where available
//     const yachtDetails = {
//         name: yachtData?.name || "Luxury Yacht",
//         description: yachtData?.description || "The Luxury Yacht is one of the most popular choices...",
//         summary: {
//             idealFor: "Friends, Family, Couples, Groups, Tourists",
//             For: `${yachtData?.capacity || 6} people`,
//             location: yachtData?.pickupat || "Gateway of India, Mumbai and Goa",
//             duration: "According to preference",
//             note: "This is an exclusive private sailing experience..."
//         },
//         specifications: {
//             length: yachtData?.dimensions?.length || "65 feet",
//             capacity: `${yachtData?.capacity || "10-15"} people`,
//             crew: yachtData?.crewCount || "3"
//         },
//         meetingPoint: yachtData?.pickupat || "XYZ beach, Goa, India",
//         sailingPrice: `₹${yachtData?.price?.sailing?.toLocaleString() || "4,000"} per hour`,
//         stillPrice: `₹${yachtData?.price?.still?.toLocaleString() || "3,000"} per hour`
//     };

//     const handleCharterYacht = async () => {
//         try {
//             const response = await yachtAPI.createYacht(yachtData);
//             if (response) {
//                 // Navigate to success page or show success message
//                 navigate('/my-bookings');
//             }
//         } catch (error) {
//             console.error('Failed to create yacht:', error);
//         }
//     };

//     return (
//         <div className={styles.comp_body}>
//             <div className={styles.yatchBox}>
//                 <div className={styles.section_head}>{yachtDetails.name}</div>
//                 <div className={styles.section_head2}>Explore options to craft a unique yachting experience. </div>
//             </div>
//             <div className={styles.image_box}>
//                 <img src={Y2} alt="Yacht" className={styles.Y2} />
//             </div>
//             <div className={styles.yacht_details_box}>
//                 <div className={styles.details}>
//                     <div className={styles.prices}>
//                         <div className={styles.left}>
//                             <div className={styles.price_head}>Prices</div>
//                             <div className={styles.price_box}>
//                                 <div className={styles.pricess}>
//                                     <div className={styles.price_type}>Sailing Price</div>
//                                     <div className={styles.price_value}>{yachtDetails.sailingPrice}</div>
//                                 </div>
//                                 <div className={styles.pricess2}>
//                                     <div className={styles.price_type}>Still Price</div>
//                                     <div className={styles.price_value}>{yachtDetails.stillPrice}</div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className={styles.Right2}>
//                             <button className={styles.bookButton}  onClick={handleCharterYacht}>Charter Yacht</button>
//                         </div>  
//                     </div>
//                     <div className={styles.about}>
//                         <h3>About {yachtDetails.name}</h3>
//                         <p>{yachtDetails.description}</p>
//                     </div>
//                     <div className={styles.summary}>
//                         <h3>Summary</h3>
//                         <p><b>Ideal for:</b> {yachtDetails.summary.idealFor}</p>
//                         <p><b>For:</b> {yachtDetails.summary.For}</p>
//                         <p><b>Where:</b> {yachtDetails.summary.location}</p>
//                         <p><b>Duration:</b> {yachtDetails.summary.duration}</p>
//                         <p><b>Note:</b> {yachtDetails.summary.note}</p>
//                     </div>
//                     <div className={styles.schedule}>
//                         <h3>Sailing Schedule</h3>
//                         <ul>
//                             <li>
//                                 <b>15 Minutes:</b> Arrive at the designated starting point as per location as instructed by the
//                                 captain. Safety instructions prior to departure.
//                             </li>
//                             <li>
//                                 <b>15 Minutes:</b> The yacht journey is anchored away from the shore. You’ll be taken to a serene
//                                 natural spot.
//                             </li>
//                             <li>
//                                 <b>15 Minutes:</b> Conclude your journey with a scenic return yacht ride back to the shore.
//                             </li>
//                         </ul>
//                     </div>
//                     <div className={styles.specifications}>
//                         <h3>Specifications</h3>
//                         <p><b>Length:</b> {yachtDetails.specifications.length}</p>
//                         <p><b>Passenger Capacity:</b> {yachtDetails.specifications.capacity}</p>
//                         <p><b>Crew:</b> {yachtDetails.specifications.crew}</p>
//                     </div>
//                     <div className={styles.meetingPoint}>
//                         <h3>Meeting Point Address</h3>
//                         <p>{yachtDetails.meetingPoint}</p>
//                     </div>
//                     <div className={styles.guidelines}>
//                         <h3>Important Guidelines</h3>
//                         <ul>
//                             <li><b>Swimming Not Required:</b> Life jackets are provided, so swimming skills are not mandatory.</li>
//                             <li><b>Weather Preparedness:</b> Sailing depends on wind, tides, and clear conditions, which may cause slight schedule and route changes.</li>
//                             <li><b>Advisory Cancellations:</b> Trips from Gateway of India can be canceled by authorities; pre-payment is refundable or re-scheduled.</li>
//                             <li><b>Stop Policy:</b> Wind-up time is included in your tour time.</li>
//                             <li><b>Respect Policy:</b> Weather changes during the trip may need your cooperation.</li>
//                         </ul>
//                     </div>
//                     <div className={styles.faqs}>
//                         <h3>FAQs</h3>
//                         <p><b>Do you provide catering or food on the boat?</b><br />No, we provide snacks and soft drinks without other personal requests. You are allowed to carry your own food and soft drinks or water. (We recommend sweet yogurt as a complimentary by Goa).</p>
//                         <p><b>Can I add decorations like balloons, or cake on board?</b><br />Yes. All private yacht decorations can be directly availed.</p>
//                         <p><b>Can you make special arrangements for birthdays/anniversaries?</b><br />Yes. We have an optional arrangement service. Make sure you confirm answers early by contacting our staff.</p>
//                         <p><b>Is it a fixed location tour and will I describe the tour on my own?</b><br />Yes. It is included and can be based on healthy weather discovery material that you may want to try!</p>
//                     </div>
//                     <div className={styles.cancellation}>
//                         <h3>Cancellation & Refund Policy</h3>
//                         <p><b>Private Cancellations:</b> A refund is allowed if the booking is canceled due to unforeseeable weather, technical issues, or security protocols.</p>
//                         <p><b>Customer Cancellations:</b> No refunds will be provided for cancellations made by the customer.</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Review;
