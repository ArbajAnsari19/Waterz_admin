import React from "react";
import styles from "../../styles/Booking/BookingDetails.module.css";
import Y2 from "../../assets/Yatch/Y2.svg";
import { useLocation } from "react-router-dom";

const BookingDetail: React.FC = () => {
    const location = useLocation();
    const { booking } = location.state || {};

    console.log("booking", booking)

    if (!booking) {
        return <div>No booking details available</div>;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.comp_body}>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>Booking #{booking._id}</div>
                <div className={styles.section_head2}>Yacht Booking Details</div>
            </div>
            <div className={styles.image_box}>
                <img src={booking.images?.[0] || Y2} alt="Yacht" className={styles.Y2} />
            </div>
            <div className={styles.yacht_details_box}>
                <div className={styles.details}>
                    <div className={styles.prices}>
                        {/* <div className={styles.left}>
                            <div className={styles.price_head}>Booking Details</div>
                            <div className={styles.price_box}>
                                <div className={styles.pricess}>
                                    <div className={styles.price_type}>Start Date</div>
                                    <div className={styles.price_value}>{booking.startDate} hours</div>
                                </div>
                                <div className={styles.pricess2}>
                                    <div className={styles.price_type}>Still Time</div>
                                    <div className={styles.price_value}>{booking.stillTime} hours</div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    <div className={styles.about}>
                        <h3>Booking Status</h3>
                        <p><b>Payment Status:</b> {booking.paymentStatus}</p>
                        <p><b>Booking Status:</b> {booking.status}</p>
                        <p><b>Ride Status:</b> {booking.rideStatus}</p>
                    </div>
                    <div className={styles.summary}>
                        <h3>Booking Summary</h3>
                        <p><b>Total Amount:</b> ₹{booking.totalAmount}</p>
                        <p><b>Duration:</b> {booking.duration} hours</p>
                        <p><b>Number of People:</b> {booking.PeopleNo}</p>
                        <p><b>Location:</b> {booking.location}</p>
                        <p><b>Special Event:</b> {booking.specialEvent}</p>
                    </div>
                    <div className={styles.schedule}>
                        <h3>Time Schedule</h3>
                        <ul>
                            <li>
                                <b>Start Date & Time:</b> {formatDate(booking.startDate)}
                            </li>
                            <li>
                                <b>End Date & Time:</b> {formatDate(booking.endDate)}
                            </li>
                            <li>
                                <b>Total Duration:</b> {booking.duration} hours (Sailing: {booking.sailingTime}h, Still: {booking.stillTime}h)
                            </li>
                        </ul>
                    </div>
                    <div className={styles.specifications}>
                        <h3>Special Requests</h3>
                        <p>{booking.specialRequest || "No special requests"}</p>
                    </div>
                    <div className={styles.meetingPoint}>
                        <h3>Booking Information</h3>
                        <p><b>Booking ID:</b> {booking._id}</p>
                        <p><b>Created At:</b> {formatDate(booking.createdAt)}</p>
                        <p><b>Last Updated:</b> {formatDate(booking.updatedAt)}</p>
                    </div>
                    <div className={styles.guidelines}>
                        <h3>Important Guidelines</h3>
                        <ul>
                            <li><b>Swimming Not Required:</b> Life jackets are provided, so swimming skills are not mandatory.</li>
                            <li><b>Weather Preparedness:</b> Sailing depends on wind, tides, and clear conditions, which may cause slight schedule and route changes.</li>
                            <li><b>Advisory Cancellations:</b> Trips can be canceled by authorities; pre-payment is refundable or re-scheduled.</li>
                            <li><b>Stop Policy:</b> Wind-up time is included in your tour time.</li>
                            <li><b>Respect Policy:</b> Weather changes during the trip may need your cooperation.</li>
                        </ul>
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

export default BookingDetail;