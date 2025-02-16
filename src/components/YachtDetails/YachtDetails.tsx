import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/YachtDetails/YachtDetails.module.css";
import { Yacht } from "../../types/yachts";
import { adminAPI } from "../../api/admin";
import { handleApiError } from "../../api/errorHandler";
import { CustomError } from "../../types/error";
import { useAppDispatch } from "../../redux/store/hook";
import { yachtAPI } from "../../api/yachts";

// Constant details remain unchanged
const constantDetails = {
  schedule: [
    {
      time: "15 Minutes",
      description:
        "Arrive at the designated starting point as per location as instructed by the captain. Safety instructions prior to departure.",
    },
    {
      time: "15 Minutes",
      description:
        "The yacht journey is anchored away from the shore. You'll be taken to a serene natural spot.",
    },
    {
      time: "15 Minutes",
      description:
        "Conclude your journey with a scenic return yacht ride back to the shore.",
    },
  ],
  guidelines: [
    {
      title: "Swimming Not Required",
      content:
        "Life jackets are provided, so swimming skills are not mandatory.",
    },
    {
      title: "Weather Preparedness",
      content:
        "Sailing depends on wind, tides, and clear conditions, which may cause slight schedule and route changes.",
    },
    {
      title: "Advisory Cancellations",
      content:
        "Trips from Gateway of India can be canceled by authorities; pre-payment is refundable or re-scheduled.",
    },
    {
      title: "Stop Policy",
      content: "Wind-up time is included in your tour time.",
    },
    {
      title: "Respect Policy",
      content:
        "Weather changes during the trip may need your cooperation.",
    },
  ],
  faqs: [
    {
      question: "Do you provide catering or food on the boat?",
      answer:
        "No, we provide snacks and soft drinks without other personal requests. You are allowed to carry your own food and soft drinks or water. (We recommend sweet yogurt as a complimentary by Goa).",
    },
    {
      question: "Can I add decorations like balloons, or cake on board?",
      answer: "Yes. All private yacht decorations can be directly availed.",
    },
    {
      question: "Can you make special arrangements for birthdays/anniversaries?",
      answer:
        "Yes. We have an optional arrangement service. Make sure you confirm answers early by contacting our staff.",
    },
    {
      question:
        "Is it a fixed location tour and will I describe the tour on my own?",
      answer:
        "Yes. It is included and can be based on healthy weather discovery material that you may want to try!",
    },
  ],
  cancellationPolicy: {
    private:
      "A refund is allowed if the booking is canceled due to unforeseeable weather, technical issues, or security protocols.",
    customer:
      "No refunds will be provided for cancellations made by the customer.",
  },
};

interface SetPrices {
  peak: {
    sailing: string;
    anchoring: string;
  };
  nonPeak: {
    sailing: string;
    anchoring: string;
  };
}

const YachtDetails: React.FC = () => {
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [, setShowPricingPanel] = useState(false);
  const [prices, setPrices] = useState<SetPrices>({
    peak: { sailing: "", anchoring: "" },
    nonPeak: { sailing: "", anchoring: "" },
  });

  const location = useLocation();
  const listingStatus = location.state?.listStatus; // "requested" | "accepted" | "denied"
  const { id: yachtId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchYachtDetails = async () => {
      if (!yachtId) return;
      try {
        setLoading(true);
        const data = await yachtAPI.getYachtById(yachtId);
        // @ts-ignore
        const yacht = data.yatch;
        setYacht(yacht);
        // Pre-fill pricing state from yacht data if available
        if (data && yacht.price) {
          setPrices({
            peak: {
              sailing: yacht.price.sailing.peakTime || "",
              anchoring: yacht.price.anchoring?.peakTime || "",
            },
            nonPeak: {
              sailing: yacht.price.sailing.nonPeakTime || "",
              anchoring: yacht.price.anchoring.nonPeakTime || "",
            },
          });
        }
      } catch (error) {
        handleApiError(error as CustomError, dispatch, navigate);
      } finally {
        setLoading(false);
      }
    };

    fetchYachtDetails();
  }, [yachtId, dispatch, navigate]);

  const handlePriceChange = (
    category: "peak" | "nonPeak",
    type: "sailing" | "anchoring",
    value: string
  ) => {
    setPrices((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value,
      },
    }));
  };

  // Approve yacht pricing (for "requested" listings)
  const handleApproveYacht = async () => {
    if (!yacht) return;
    const peakSailing = parseFloat(prices.peak.sailing);
    const peakAnchoring = parseFloat(prices.peak.anchoring);
    const nonPeakSailing = parseFloat(prices.nonPeak.sailing);
    const nonPeakAnchoring = parseFloat(prices.nonPeak.anchoring);
    if (
      [peakSailing, peakAnchoring, nonPeakSailing, nonPeakAnchoring].some(
        (val) => isNaN(val) || val <= 0
      )
    ) {
      alert("Please enter valid prices for all fields.");
      return;
    }
    try {
      setPricingLoading(true);
      await adminAPI.approveYacht({
        yatchId: yacht._id,
        approved: "accepted",
        sailingPeakTimePrice: peakSailing,
        anchoringPeakTimePrice: peakAnchoring,
        sailingNonPeakTimePrice: nonPeakSailing,
        anchoringNonPeakTimePrice: nonPeakAnchoring,
      });
      // Update local yacht status to accepted
      setYacht({ ...yacht, isVerifiedByAdmin: "accepted" });
      setShowPricingPanel(false);
      alert("Yacht pricing approved successfully.");
    } catch (error) {
      console.error("Error approving yacht pricing:", error);
      alert("Failed to approve pricing. Please try again.");
    } finally {
      setPricingLoading(false);
    }
  };

  // Reject yacht pricing (for "requested" listings)
  const handleRejectYacht = async () => {
    if (!yacht) return;
    if (!window.confirm("Are you sure you want to reject this yacht listing?")) {
      return;
    }
    try {
      setPricingLoading(true);
      await adminAPI.approveYacht({
        yatchId: yacht._id,
        approved: "denied",
        sailingPeakTimePrice: 0,
        anchoringPeakTimePrice: 0,
        sailingNonPeakTimePrice: 0,
        anchoringNonPeakTimePrice: 0,
      });
      setYacht({ ...yacht, isVerifiedByAdmin: "denied" });
      setShowPricingPanel(false);
      alert("Yacht pricing rejected successfully.");
    } catch (error) {
      console.error("Error rejecting yacht pricing:", error);
      alert("Failed to reject pricing. Please try again.");
    } finally {
      setPricingLoading(false);
    }
  };

  // Update yacht pricing (for "accepted" listings)
  const handleUpdatePricing = async () => {
    if (!yacht) return;
    const peakSailing = parseFloat(prices.peak.sailing);
    const peakAnchoring = parseFloat(prices.peak.anchoring);
    const nonPeakSailing = parseFloat(prices.nonPeak.sailing);
    const nonPeakAnchoring = parseFloat(prices.nonPeak.anchoring);
    if (
      [peakSailing, peakAnchoring, nonPeakSailing, nonPeakAnchoring].some(
        (val) => isNaN(val) || val <= 0
      )
    ) {
      alert("Please enter valid prices for all fields.");
      return;
    }
    try {
      setPricingLoading(true);
      await adminAPI.updateYachtPricing({
        yatchId: yacht._id,
        approved: "accepted",
        sailingPeakTimePrice: peakSailing,
        anchoringPeakTimePrice: peakAnchoring,
        sailingNonPeakTimePrice: nonPeakSailing,
        anchoringNonPeakTimePrice: nonPeakAnchoring,
      });
      setShowPricingPanel(false);
      alert("Yacht pricing updated successfully.");
    } catch (error) {
      console.error("Error updating yacht pricing:", error);
      alert("Failed to update pricing. Please try again.");
    } finally {
      setPricingLoading(false);
    }
  };

  const handleRemoveYacht = async () => {
    if (!yacht || !window.confirm("Are you sure you want to remove this yacht?")) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deleteYacht(yacht._id);
      navigate("/yachts");
    } catch (error) {
      console.error("Error removing yacht:", error);
      alert("Failed to remove yacht. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className={styles.loading}>Loading yacht details...</div>;
  }
  if (!yacht) {
    return <div className={styles.error}>Yacht not found</div>;
  }

  return (
    <div className={styles.comp_body}>
      <div className={styles.yatchBox}>
        <div className={styles.section_head}>{yacht.name}</div>
        <p className={styles.ownerInfo}>
          Owner: {yacht.owner} 
        </p>
      </div>

      <div className={styles.pricesContainer}>
        <div className={styles.regularPrices}>
          <div className={styles.priceColumn}>
            <h3>Peak Hours</h3>
            <p>
              Sailing: ₹{yacht.price.sailing.peakTime}/- per Hour
            </p>
            <p>
              Anchorage: ₹{yacht.price.anchoring?.peakTime}/- per Hour
            </p>
          </div>
          <div className={styles.priceColumn}>
            <h3>Non-Peak Hours</h3>
            <p>
              Sailing: ₹{yacht.price.sailing.nonPeakTime}/- per Hour
            </p>
            <p>
              Anchorage: ₹{yacht.price.anchoring.nonPeakTime}/- per Hour
            </p>
          </div>
        </div>
        {listingStatus !== "denied" && (
        <button className={styles.setPricesBtn} >
          Set Prices
        </button>
        )}

        {listingStatus !== "denied" && (
          <div className={styles.pricingPanel}>
            <div className={styles.pricesGrid}>
              <div className={styles.priceCategory}>
                <h4>Peak Hours</h4>
                <div className={styles.priceInputs}>
                  <div className={styles.inputGroup}>
                    <label>Sailing Price</label>
                    <input
                      type="text"
                      value={prices.peak.sailing}
                      onChange={(e) => handlePriceChange("peak", "sailing", e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Anchoring Price</label>
                    <input
                      type="text"
                      value={prices.peak.anchoring}
                      onChange={(e) => handlePriceChange("peak", "anchoring", e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.priceCategory}>
                <h4>Non-Peak Hours</h4>
                <div className={styles.priceInputs}>
                  <div className={styles.inputGroup}>
                    <label>Sailing Price</label>
                    <input
                      type="text"
                      value={prices.nonPeak.sailing}
                      onChange={(e) => handlePriceChange("nonPeak", "sailing", e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Anchoring Price</label>
                    <input
                      type="text"
                      value={prices.nonPeak.anchoring}
                      onChange={(e) => handlePriceChange("nonPeak", "anchoring", e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.pricingActions}>
              {listingStatus === "accepted" ? (
                <button className={styles.updateBtn} onClick={handleUpdatePricing} disabled={pricingLoading}>
                  {pricingLoading ? "Updating..." : "Update Pricing"}
                </button>
              ) : (
                <>
                  <button className={styles.approveBtn} onClick={handleApproveYacht} disabled={pricingLoading}>
                    {pricingLoading ? "Approving..." : "Approve"}
                  </button>
                  <button className={styles.rejectBtn} onClick={handleRejectYacht} disabled={pricingLoading}>
                    {pricingLoading ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}
            </div>
          </div>
        )} 
      </div>

      <div className={styles.image_box}>
        <img src={yacht.images[0]} alt={yacht.name} className={styles.Y2} />
      </div>

      {/* {renderActionButtons()} */}

      <button className={styles.deleteButton} onClick={handleRemoveYacht} disabled={loading}>
        {loading ? "Removing..." : "Remove Yacht"}
      </button>

      <div className={styles.yacht_details_box}>
        <div className={styles.details}>
          <div className={styles.about}>
            <h3>About {yacht.name}</h3>
            <p>{yacht.description}</p>
          </div>

          <div className={styles.summary}>
            <h3>Summary</h3>
            <p><b>Ideal for:</b> Friends, Family, Couples, Groups, Tourists</p>
            <p><b>For:</b> Up to {yacht.capacity} people</p>
            <p>
              <b>Where:</b>{" "}
              {typeof yacht.location === "object"
                ? yacht.location
                : yacht.location}
            </p>
            <p><b>Duration:</b> According to preference</p>
          </div>
          <div className={styles.guidelines}>
            <h3>Important Guidelines</h3>
            <ul>
              {constantDetails.guidelines.map((item, index) => (
                <li key={index}><b>{item.title}:</b> {item.content}</li>
              ))}
            </ul>
          </div>
          <div className={styles.faqs}>
            <h3>FAQs</h3>
            {constantDetails.faqs.map((faq, index) => (
              <p key={index}><b>{faq.question}</b><br />{faq.answer}</p>
            ))}
          </div>
          <div className={styles.cancellation}>
            <h3>Cancellation & Refund Policy</h3>
            <p><b>Private Cancellations:</b> {constantDetails.cancellationPolicy.private}</p>
            <p><b>Customer Cancellations:</b> {constantDetails.cancellationPolicy.customer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YachtDetails;




// // YachtDetails.tsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from "../../styles/YachtDetails/YachtDetails.module.css";
// import { Yacht } from '../../types/yachts';
// import { yachtAPI } from '../../api/yachts';
// import { handleApiError } from '../../api/errorHandler';
// import { CustomError } from '../../types/error';
// import { useAppDispatch } from '../../redux/store/hook';
// import { useLocation } from 'react-router-dom';
// // Constant details remain unchanged
// const constantDetails = {
//     schedule: [
//         {
//             time: "15 Minutes",
//             description: "Arrive at the designated starting point as per location as instructed by the captain. Safety instructions prior to departure."
//         },
//         {
//             time: "15 Minutes",
//             description: "The yacht journey is anchored away from the shore. You'll be taken to a serene natural spot."
//         },
//         {
//             time: "15 Minutes",
//             description: "Conclude your journey with a scenic return yacht ride back to the shore."
//         }
//     ],
//     guidelines: [
//         { title: "Swimming Not Required", content: "Life jackets are provided, so swimming skills are not mandatory." },
//         { title: "Weather Preparedness", content: "Sailing depends on wind, tides, and clear conditions, which may cause slight schedule and route changes." },
//         { title: "Advisory Cancellations", content: "Trips from Gateway of India can be canceled by authorities; pre-payment is refundable or re-scheduled." },
//         { title: "Stop Policy", content: "Wind-up time is included in your tour time." },
//         { title: "Respect Policy", content: "Weather changes during the trip may need your cooperation." }
//     ],
//     faqs: [
//         {
//             question: "Do you provide catering or food on the boat?",
//             answer: "No, we provide snacks and soft drinks without other personal requests. You are allowed to carry your own food and soft drinks or water. (We recommend sweet yogurt as a complimentary by Goa)."
//         },
//         {
//             question: "Can I add decorations like balloons, or cake on board?",
//             answer: "Yes. All private yacht decorations can be directly availed."
//         },
//         {
//             question: "Can you make special arrangements for birthdays/anniversaries?",
//             answer: "Yes. We have an optional arrangement service. Make sure you confirm answers early by contacting our staff."
//         },
//         {
//             question: "Is it a fixed location tour and will I describe the tour on my own?",
//             answer: "Yes. It is included and can be based on healthy weather discovery material that you may want to try!"
//         }
//     ],
//     cancellationPolicy: {
//         private: "A refund is allowed if the booking is canceled due to unforeseeable weather, technical issues, or security protocols.",
//         customer: "No refunds will be provided for cancellations made by the customer."
//     }
// };

// interface SetPrices {
//     peak: {
//         sailing: string;
//         still: string;
//     };
//     nonPeak: {
//         sailing: string;
//         still: string;
//     };
// }

// const YachtDetails: React.FC = () => {
//     const [yacht, setYacht] = useState<Yacht | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [showSetPrices, setShowSetPrices] = useState(false);
//     const [prices, setPrices] = useState<SetPrices>({
//         peak: { sailing: '', still: '' },
//         nonPeak: { sailing: '', still: '' }
//     });

//     const { state } = useLocation();
//     const listingStatus = state?.listStatus;
//     // console.log("listingStatus", listingStatus)

//     const { id: yachtId } = useParams<{ id: string }>();
//     const navigate = useNavigate();
//     const dispatch = useAppDispatch();

//     useEffect(() => {
//         const fetchYachtDetails = async () => {
//             if (!yachtId) return;
            
//             try {
//                 setLoading(true);
//                 const data = await yachtAPI.getYachtById(yachtId);
//                 setYacht(data);
//             } catch (error) {
//                 handleApiError(error as CustomError, dispatch, navigate);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchYachtDetails();
//     }, [yachtId, dispatch, navigate]);

//     const handlePriceChange = (category: 'peak' | 'nonPeak', type: 'sailing' | 'still', value: string) => {
//         setPrices(prev => ({
//             ...prev,
//             [category]: {
//                 ...prev[category],
//                 [type]: value
//             }
//         }));
//     };

//     const handleSavePrices = async () => {
//         // Implement save prices logic here
//         console.log('Saving prices:', prices);
//     };

//     const renderActionButtons = () => {
//         switch (listingStatus) {
//             case 'requested':
//                 return (
//                     <div className={styles.actionButtons}>
//                         <button className={styles.approveBtn} onClick={handleApprove}>Approve</button>
//                         <button className={styles.rejectBtn} onClick={handleReject}>Reject</button>
//                     </div>
//                 );
//             case 'accepted':
//                 return (
//                     <div className={styles.actionButtons}>
//                         <button 
//                             className={styles.updateBtn}
//                             onClick={() => setShowSetPrices(true)}
//                         >
//                             Update Details
//                         </button>
//                     </div>
//                 );
//             case 'denied':
//                 return null; // No buttons shown for denied listings
//             default:
//                 return null;
//         }
//     };

//     const handleApprove = async () => {
//         try {
//             // await yachtAPI.updateYachtStatus(yachtId, 'listed');
//             // Handle success (e.g., show toast, redirect)
//         } catch (error) {
//             handleApiError(error as CustomError, dispatch, navigate);
//         }
//     };

//     const handleReject = async () => {
//         try {
//             // await yachtAPI.updateYachtStatus(yachtId, 'denied');
//             // Handle success (e.g., show toast, redirect)
//         } catch (error) {
//             handleApiError(error as CustomError, dispatch, navigate);
//         }
//     };

//     if (loading) {
//         return <div className={styles.loading}>Loading yacht details...</div>;
//     }

//     if (!yacht) {
//         return <div className={styles.error}>Yacht not found</div>;
//     }

//     return (
//         <div className={styles.comp_body}>
//             <div className={styles.yatchBox}>
//                 <div className={styles.section_head}>{yacht.name}</div>
//                 <p className={styles.ownerInfo}>
//                     Owner: {yacht.owner} (<span className={styles.viewProfile}>view profile</span>)
//                 </p>
//             </div>

//             <div className={styles.pricesContainer}>
//                 <div className={styles.regularPrices}>
//                     <div className={styles.priceColumn}>
//                         <h3>Sailing Price</h3>
//                         <p>₹{yacht.price.sailing}/- per Hour</p>
//                     </div>
//                     <div className={styles.priceColumn}>
//                         <h3>Still Price</h3>
//                         <p>₹{yacht.price.still}/- per Hour</p>
//                     </div>
//                 </div>

//                 <button 
//                     className={styles.setPricesBtn}
//                     onClick={() => setShowSetPrices(!showSetPrices)}
//                 >
//                     Set Prices
//                 </button>

//                 {showSetPrices && (
//                     <div className={styles.setPricesPanel}>
//                         <div className={styles.pricesGrid}>
//                             <div className={styles.priceCategory}>
//                                 <h4>Peak Hours</h4>
//                                 <div className={styles.priceInputs}>
//                                     <div className={styles.inputGroup}>
//                                         <label>Sailing Price</label>
//                                         <input
//                                             type="text"
//                                             value={prices.peak.sailing}
//                                             onChange={(e) => handlePriceChange('peak', 'sailing', e.target.value)}
//                                             placeholder="Enter price"
//                                         />
//                                     </div>
//                                     <div className={styles.inputGroup}>
//                                         <label>Still Price</label>
//                                         <input
//                                             type="text"
//                                             value={prices.peak.still}
//                                             onChange={(e) => handlePriceChange('peak', 'still', e.target.value)}
//                                             placeholder="Enter price"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className={styles.priceCategory}>
//                                 <h4>Non-Peak Hours</h4>
//                                 <div className={styles.priceInputs}>
//                                     <div className={styles.inputGroup}>
//                                         <label>Sailing Price</label>
//                                         <input
//                                             type="text"
//                                             value={prices.nonPeak.sailing}
//                                             onChange={(e) => handlePriceChange('nonPeak', 'sailing', e.target.value)}
//                                             placeholder="Enter price"
//                                         />
//                                     </div>
//                                     <div className={styles.inputGroup}>
//                                         <label>Still Price</label>
//                                         <input
//                                             type="text"
//                                             value={prices.nonPeak.still}
//                                             onChange={(e) => handlePriceChange('nonPeak', 'still', e.target.value)}
//                                             placeholder="Enter price"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <button className={styles.savePricesBtn} onClick={handleSavePrices}>
//                             Save Prices
//                         </button>
//                     </div>
//                 )}
//             </div>

//             <div className={styles.image_box}>
//                 <img src={yacht.images[0]} alt={yacht.name} className={styles.Y2} />
//             </div>

//             {renderActionButtons()}

//             {/* Rest of the sections remain unchanged */}
//             <div className={styles.yacht_details_box}>
//                 <div className={styles.details}>
//                     <div className={styles.about}>
//                         <h3>About {yacht.name}</h3>
//                         <p>{yacht.description}</p>
//                     </div>

//                     <div className={styles.summary}>
//                         <h3>Summary</h3>
//                         <p><b>Ideal for:</b> Friends, Family, Couples, Groups, Tourists</p>
//                         <p><b>For:</b> Up to {yacht.capacity} people</p>
//                         <p><b>Where:</b> {typeof yacht.location === 'object' ? 
//                             yacht.location.coordinates.join(', ') : yacht.location}</p>
//                         <p><b>Duration:</b> According to preference</p>
//                     </div>
//                     <div className={styles.guidelines}>
//                         <h3>Important Guidelines</h3>
//                         <ul>
//                             {constantDetails.guidelines.map((item, index) => (
//                                 <li key={index}><b>{item.title}:</b> {item.content}</li>
//                             ))}
//                         </ul>
//                     </div>
//                     <div className={styles.faqs}>
//                         <h3>FAQs</h3>
//                         {constantDetails.faqs.map((faq, index) => (
//                             <p key={index}><b>{faq.question}</b><br />{faq.answer}</p>
//                         ))}
//                     </div>
//                     <div className={styles.cancellation}>
//                         <h3>Cancellation & Refund Policy</h3>
//                         <p><b>Private Cancellations:</b> {constantDetails.cancellationPolicy.private}</p>
//                         <p><b>Customer Cancellations:</b> {constantDetails.cancellationPolicy.customer}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default YachtDetails;
