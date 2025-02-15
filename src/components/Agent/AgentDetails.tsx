import React, { useEffect, useState } from "react";
import styles from "../../styles/Agent/AgentDetails.module.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import agentPlaceholder from "../../assets/Yatch/agent.svg";
import { IAgent } from "../../types/agent";
import { adminAPI } from "../../api/admin";

const AgentDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [agentData, setAgentData] = useState<IAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommissionPanel, setShowCommissionPanel] = useState(false);
  const [commissionInput, setCommissionInput] = useState<string>("");

  const isPrev = location.state ? location.state.isPrev : false;

  const agent = location.state ? location.state.agent : null;
  console.log("agent", agent)

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (location.state?.agent) {
        setAgentData(location.state.agent);
        setCommissionInput(location.state.agent.commissionRate.toString());
        return;
      }

      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getAgentById(agent._id);
        if (response.agent) {
          setAgentData(response.agent);
          setCommissionInput(response.agent.commissionRate.toString());
        }
      } catch (err) {
        console.error("Error fetching agent details:", err);
        setError("Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id, location.state]);

  const handleDeleteAgent = async () => {
    if (
      !agentData ||
      !window.confirm("Are you sure you want to remove this agent? This action cannot be undone.")
    ) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.removeAgentById(agentData.id);
      navigate("/agents");
    } catch (err) {
      console.error("Error deleting agent:", err);
      setError("Failed to delete agent");
    } finally {
      setLoading(false);
    }
  };

  // Approve agent with commission (requested status)
  const handleApproveAgent = async () => {
    if (!agentData) return;
    const commission = parseFloat(commissionInput);
    if (isNaN(commission) || commission <= 0) {
      alert("Please enter a valid commission percentage.");
      return;
    }

    try {
      setCommissionLoading(true);
      await adminAPI.approveAgent({
        id: agent._id,
        approved: "accepted",
        commision: commission,
      });
      setAgentData({ ...agentData, commissionRate: commission, isVerifiedByAdmin: "accepted" });
      setShowCommissionPanel(false);
      alert("Agent approved successfully.");
    } catch (err) {
      console.error("Error approving agent:", err);
      alert("Failed to approve agent. Please try again.");
    } finally {
      setCommissionLoading(false);
    }
  };

  // Reject agent (requested status)
  const handleRejectAgent = async () => {
    if (!agentData) return;
    if (!window.confirm("Are you sure you want to reject this agent?")) {
      return;
    }
    try {
      setCommissionLoading(true);
      await adminAPI.approveAgent({
        id: agent._id,
        approved: "denied",
        commision: 0,
      });
      setAgentData({ ...agentData, isVerifiedByAdmin: "denied" });
      setShowCommissionPanel(false);
      alert("Agent rejected successfully.");
    } catch (err) {
      console.error("Error rejecting agent:", err);
      alert("Failed to reject agent. Please try again.");
    } finally {
      setCommissionLoading(false);
    }
  };

  // Update commission for an already approved agent
  const handleUpdateCommission = async () => {
    if (!agentData) return;
    const commission = parseFloat(commissionInput);
    if (isNaN(commission) || commission <= 0) {
      alert("Please enter a valid commission percentage.");
      return;
    }
    try {
      setCommissionLoading(true);
      await adminAPI.updateAgentCommison({
        id: agent._id,
        approved: "accepted",
        commision: commission,
      });
      setAgentData({ ...agentData, commissionRate: commission });
      setShowCommissionPanel(false);
      alert("Commission updated successfully.");
    } catch (err) {
      console.error("Error updating commission:", err);
      alert("Failed to update commission. Please try again.");
    } finally {
      setCommissionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.comp_body}>
        <div className={styles.loadingContainer}>Loading agent details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.comp_body}>
        <div className={styles.errorContainer}>{error}</div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className={styles.comp_body}>
        <div className={styles.errorContainer}>Agent not found</div>
      </div>
    );
  }

  const renderCommissionActions = () => {
    if (agentData.isVerifiedByAdmin === "denied") return null;

    if (agentData.isVerifiedByAdmin === "requested") {
      return (
        <div className={styles.commissionSection}>
          {!showCommissionPanel ? (
            <button
              className={styles.commissionButton}
              onClick={() => setShowCommissionPanel(true)}
            >
              Set Commission
            </button>
          ) : (
            <div className={styles.commissionPanel}>
              <label>
                Commission Percentage (%):
                <input
                  type="number"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  placeholder="Enter commission %"
                />
              </label>
              <div className={styles.commissionActions}>
                <button
                  className={styles.approveButton}
                  onClick={handleApproveAgent}
                  disabled={commissionLoading}
                >
                  {commissionLoading ? "Approving..." : "Approve"}
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={handleRejectAgent}
                  disabled={commissionLoading}
                >
                  {commissionLoading ? "Rejecting..." : "Reject"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowCommissionPanel(false)}
                  disabled={commissionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (agentData.isVerifiedByAdmin === "accepted") {
      return (
        <div className={styles.commissionSection}>
          {!showCommissionPanel ? (
            <button
              className={styles.commissionButton}
              onClick={() => setShowCommissionPanel(true)}
            >
              Edit Commission
            </button>
          ) : (
            <div className={styles.commissionPanel}>
              <label>
                Commission Percentage (%):
                <input
                  type="number"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  placeholder="Enter commission %"
                />
              </label>
              <div className={styles.commissionActions}>
                <button
                  className={styles.updateButton}
                  onClick={handleUpdateCommission}
                  disabled={commissionLoading}
                >
                  {commissionLoading ? "Updating..." : "Update Commission"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowCommissionPanel(false)}
                  disabled={commissionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.comp_body}>
      <div className={styles.agentBox}>
        <div className={styles.section_head2}>
          Agent Profile
        </div>
        <div className={styles.section_head}>{agentData.name}</div>
      </div>
      <div className={styles.profile_container}>
        <div className={styles.image_box}>
          <img
            src={agentData.imgUrl || agentPlaceholder}
            alt={agentData.name}
            className={styles.profile_image}
          />
        </div>
        <div className={styles.quick_info}>
          <div className={styles.info_item}>
            <span className={styles.label}>Experience</span>
            <span className={styles.value}>{agentData.experience} years</span>
          </div>
          <div className={styles.info_item}>
            <span className={styles.label}>Commission Rate</span>
            <span className={styles.value}>{agentData.commissionRate}%</span>
          </div>
        </div>
      </div>

      <div className={styles.action_buttons}>
        {!isPrev && (
          <>
            {renderCommissionActions()}
            <button
              className={styles.deleteButton}
              onClick={handleDeleteAgent}
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove Agent"}
            </button>
          </>
        )}
      </div>

      <div className={styles.details_section}>
        <h3>Personal Information</h3>
        <div className={styles.info_grid}>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Username:</span>
            <span className={styles.info_value}>{agentData.username}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Age:</span>
            <span className={styles.info_value}>{agentData.age} years</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Email:</span>
            <span className={styles.info_value}>{agentData.email}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Phone:</span>
            <span className={styles.info_value}>{agentData.phone}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Address:</span>
            <span className={styles.info_value}>{agentData.address}</span>
          </div>
        </div>
      </div>

      <div className={styles.details_section}>
        <h3>Bank Details</h3>
        <div className={styles.info_grid}>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Account Holder:</span>
            <span className={styles.info_value}>{agentData.accountHolderName}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Account Number:</span>
            <span className={styles.info_value}>{agentData.accountNumber}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Bank Name:</span>
            <span className={styles.info_value}>{agentData.bankName}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>IFSC Code:</span>
            <span className={styles.info_value}>{agentData.ifscCode}</span>
          </div>
        </div>
      </div>

      <div className={styles.details_section}>
        <h3>Performance Metrics</h3>
        <div className={styles.metrics_grid}>
          <div className={styles.metric_card}>
            <span className={styles.metric_label}>Total Bookings</span>
            <span className={styles.metric_value}>
              {agentData.bookings?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;




// import React, { useEffect, useState } from "react";
// import styles from "../../styles/Agent/AgentDetails.module.css";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import agent from "../../assets/Yatch/agent.svg";
// import { IAgent } from "../../types/agent";
// import { adminAPI } from "../../api/admin";

// const AgentDetails: React.FC = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { id } = useParams();
//     const [agentData, setAgentData] = useState<IAgent | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
    
//     const isPrev = location.state ? location.state.isPrev : false;

//     useEffect(() => {
//         const fetchAgentDetails = async () => {
//             if (location.state?.agent) {
//                 setAgentData(location.state.agent);
//                 return;
//             }

//             if (!id) return;

//             try {
//                 setLoading(true);
//                 setError(null);
//                 // Replace with your actual API call
//                 const response = await adminAPI.getAgentById(id);
//                 if (response.agent) {
//                     setAgentData(response.agent);
//                 }
//             } catch (err) {
//                 console.error("Error fetching agent details:", err);
//                 setError("Failed to load agent details");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAgentDetails();
//     }, [id, location.state]);


//     const handleDeleteAgent = async () => {
//         if (!agentData || !window.confirm("Are you sure you want to remove this agent? This action cannot be undone.")) {
//             return;
//         }

//         try {
//             setLoading(true);
//             // Replace with your actual API call
//             await adminAPI.removeAgentById(agentData.id);
//             navigate("/agents");
//         } catch (err) {
//             console.error("Error deleting agent:", err);
//             setError("Failed to delete agent");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className={styles.comp_body}>
//                 <div className={styles.loadingContainer}>Loading agent details...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className={styles.comp_body}>
//                 <div className={styles.errorContainer}>{error}</div>
//             </div>
//         );
//     }

//     if (!agentData) {
//         return (
//             <div className={styles.comp_body}>
//                 <div className={styles.errorContainer}>Agent not found</div>
//             </div>
//         );
//     }

//     return (
//         <div className={styles.comp_body}>
//             <div className={styles.agentBox}>
//                 <div className={styles.section_head}>{agentData.name}</div>
//                 <div className={styles.section_head2}>Agent Profile and Performance Details</div>
//             </div>
//             <div className={styles.profile_container}>
//                 <div className={styles.image_box}>
//                     <img 
//                         src={agentData.imgUrl || agent} 
//                         alt={agentData.name} 
//                         className={styles.profile_image} 
//                     />
//                 </div>
//                 <div className={styles.quick_info}>
//                     <div className={styles.info_item}>
//                         <span className={styles.label}>Experience</span>
//                         <span className={styles.value}>{agentData.experience} years</span>
//                     </div>
//                     <div className={styles.info_item}>
//                         <span className={styles.label}>Commission Rate</span>
//                         <span className={styles.value}>{agentData.commissionRate}%</span>
//                     </div>
//                 </div>
//             </div>

//             <div className={styles.details_container}>
//                 <div className={styles.action_buttons}>
//                     {!isPrev && (
//                         <>
//                             {/* <button 
//                                 className={styles.editButton}
//                                 onClick={handleEditAgent}
//                             >
//                                 Edit Details
//                             </button> */}
//                             <button 
//                                 className={styles.deleteButton}
//                                 onClick={handleDeleteAgent}
//                                 disabled={loading}
//                             >
//                                 {loading ? 'Removing...' : 'Remove Agent'}
//                             </button>
//                         </>
//                     )}
//                 </div>

//                 <div className={styles.details_section}>
//                     <h3>Personal Information</h3>
//                     <div className={styles.info_grid}>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Username:</span>
//                             <span className={styles.info_value}>{agentData.username}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Age:</span>
//                             <span className={styles.info_value}>{agentData.age} years</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Email:</span>
//                             <span className={styles.info_value}>{agentData.email}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Phone:</span>
//                             <span className={styles.info_value}>{agentData.phone}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Address:</span>
//                             <span className={styles.info_value}>{agentData.address}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={styles.details_section}>
//                     <h3>Bank Details</h3>
//                     <div className={styles.info_grid}>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Account Holder:</span>
//                             <span className={styles.info_value}>{agentData.accountHolderName}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Account Number:</span>
//                             <span className={styles.info_value}>{agentData.accountNumber}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>Bank Name:</span>
//                             <span className={styles.info_value}>{agentData.bankName}</span>
//                         </div>
//                         <div className={styles.info_row}>
//                             <span className={styles.info_label}>IFSC Code:</span>
//                             <span className={styles.info_value}>{agentData.ifscCode}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={styles.details_section}>
//                     <h3>Performance Metrics</h3>
//                     <div className={styles.metrics_grid}>
//                         <div className={styles.metric_card}>
//                             <span className={styles.metric_label}>Total Bookings</span>
//                             <span className={styles.metric_value}>
//                                 {agentData.bookings?.length || 0}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AgentDetails;