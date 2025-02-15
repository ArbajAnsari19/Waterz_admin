import React, { useEffect, useState } from "react";
import styles from "../../styles/Agent/SuperAgentDetails.module.css";
import { useLocation,  useParams } from "react-router-dom";
import superAgentPlaceholder from "../../assets/Yatch/agent.svg";
import { SuperAgentData } from "../../types/superAgent";
import { adminAPI } from "../../api/admin";

const SuperAgentDetails: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();
  const [superAgentData, setSuperAgentData] = useState<SuperAgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommissionPanel, setShowCommissionPanel] = useState(false);
  const [commissionInput, setCommissionInput] = useState<string>("");

  const isPrev = location.state ? location.state.isPrev : false;

  const superAgent = location.state ? location.state.superAgent : null;
  console.log("superAgnt", superAgent)

  useEffect(() => {
    const fetchSuperAgentDetails = async () => {
      if (location.state?.superAgent) {
        setSuperAgentData(location.state.superAgent);
        setCommissionInput(location.state.superAgent.commissionRate.toString());
        return;
      }

      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        // Assume getSuperAgentById exists similar to getAgentById
        const response = await adminAPI.getSuperAgentById(id);
        console.log("superAgent", response.superAgent)
        if (response.superAgent) {
          setSuperAgentData(response.superAgent);
          setCommissionInput(response.superAgent.commissionRate.toString());
        }
      } catch (err) {
        console.error("Error fetching super agent details:", err);
        setError("Failed to load super agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAgentDetails();
  }, [id, location.state]);



  // Approve super agent with commission (requested status)
  const handleApproveSuperAgent = async () => {
    if (!superAgentData) return;
    const commission = parseFloat(commissionInput);
    if (isNaN(commission) || commission <= 0) {
      alert("Please enter a valid commission percentage.");
      return;
    }

    try {
      setCommissionLoading(true);
      await adminAPI.approveSuperAgent({
        id: superAgentData._id,
        approved: "accepted",
        commision: commission,
      });
      setSuperAgentData({ ...superAgentData, commissionRate: commission, isVerifiedByAdmin: "accepted" } as any);
      setShowCommissionPanel(false);
      alert("Super Agent approved successfully.");
    } catch (err) {
      console.error("Error approving super agent:", err);
      alert("Failed to approve super agent. Please try again.");
    } finally {
      setCommissionLoading(false);
    }
  };

  // Reject super agent (requested status)
  const handleRejectSuperAgent = async () => {
    if (!superAgentData) return;
    if (!window.confirm("Are you sure you want to reject this super agent?")) {
      return;
    }
    try {
      setCommissionLoading(true);
      await adminAPI.approveSuperAgent({
        id: superAgentData._id,
        approved: "denied",
        commision: 0,
      });
      setSuperAgentData({ ...superAgentData, isVerifiedByAdmin: "denied" } as any);
      setShowCommissionPanel(false);
      alert("Super Agent rejected successfully.");
    } catch (err) {
      console.error("Error rejecting super agent:", err);
      alert("Failed to reject super agent. Please try again.");
    } finally {
      setCommissionLoading(false);
    }
  };

  // Update commission for an already approved super agent
  const handleUpdateCommission = async () => {
    if (!superAgentData) return;
    const commission = parseFloat(commissionInput);
    if (isNaN(commission) || commission <= 0) {
      alert("Please enter a valid commission percentage.");
      return;
    }
    try {
      setCommissionLoading(true);
      await adminAPI.updateSuperAgentCommison({
        id: superAgentData._id,
        approved: "accepted",
        commision: commission,
      });
      setSuperAgentData({ ...superAgentData, commissionRate: commission });
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
        <div className={styles.loadingContainer}>Loading super agent details...</div>
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

  if (!superAgentData) {
    return (
      <div className={styles.comp_body}>
        <div className={styles.errorContainer}>Super Agent not found</div>
      </div>
    );
  }

  const renderCommissionActions = () => {
    if (superAgentData.isVerifiedByAdmin === "denied") return null;

    if (superAgentData.isVerifiedByAdmin === "requested") {
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
                  onClick={handleApproveSuperAgent}
                  disabled={commissionLoading}
                >
                  {commissionLoading ? "Approving..." : "Approve"}
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={handleRejectSuperAgent}
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

    if (superAgentData.isVerifiedByAdmin === "accepted") {
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
        <div className={styles.section_head2}>Super Agent Profile</div>
        <div className={styles.section_head}>{superAgentData.name}</div>
      </div>
      <div className={styles.profile_container}>
        <div className={styles.image_box}>
          <img
            src={superAgentData.imgUrl || superAgentPlaceholder}
            alt={superAgentData.name}
            className={styles.profile_image}
          />
        </div>
        <div className={styles.quick_info}>
          {/* <div className={styles.info_item}>
            <span className={styles.label}>Name</span>
            <span className={styles.value}>{superAgentData.name}</span>
          </div>
          <div className={styles.info_item}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{superAgentData.email}</span>
          </div>
          <div className={styles.info_item}>
            <span className={styles.label}>Phone</span>
            <span className={styles.value}>{superAgentData.phone}</span>
          </div> */}
          <div className={styles.info_item}>
            <span className={styles.label}>Commisio Rate</span>
            <span className={styles.value}>{superAgentData.commissionRate}%</span>
          </div>
        </div>
      </div>

      <div className={styles.action_buttons}>
        {!isPrev && (
          <>
            {renderCommissionActions()}
          </>
        )}
      </div>

      <div className={styles.details_section}>
        <h3>Personal Information</h3>
        <div className={styles.info_grid}>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Name:</span>
            <span className={styles.info_value}>{superAgentData.name}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Email:</span>
            <span className={styles.info_value}>{superAgentData.email}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Phone:</span>
            <span className={styles.info_value}>{superAgentData.phone}</span>
          </div>
          <div className={styles.info_row}>
            <span className={styles.info_label}>Commision Rate:</span>
            <span className={styles.info_value}>{superAgentData.commissionRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAgentDetails;
