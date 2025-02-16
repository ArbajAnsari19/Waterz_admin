import React from "react";
import styles from "../../styles/Home/Home.module.css"
import YachtCard from "../Layouts/YatchCard";
import hh3 from "../../assets/Home/hh3.svg";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import SolutionCard from "../Layouts/SolutionCard";
import { useTopYachts } from "../../hooks/useTopYacht";
import { Link } from "react-router-dom";

const solutionData = [
  {
    id: "solution-1",
    heading: "Agent  Network Management",
    subheading: "Oversee and manage multiple agents under your network.",
  },
  {
    id: "solution-2",
    heading: "Yacht Assignments & Commissions:",
    subheading: "Assign yachts to agents and customize commission structures.",
  },
  {
    id: "solution-3",
    heading: "Centralized Dashboard",
    subheading: "Track bookings, earnings, and performance metrics in one place.",
  },
  {
    id: "solution-4",
    heading: "Calendar Sync",
    subheading: "Sync bookings and schedules with Google calendars  for better organization and time management.",
  },
  {
    id: "solution-5",
    heading: "Secure Payment Solutions",
    subheading: "Benefit from robust and secure payment options to safeguard your transactions.",
  },
  {
    id: "solution-6",
    heading: "WhatsApp Integration",
    subheading: "Stay updated with instant system notifications and updates directly through WhatsApp",
  },
];


const Home: React.FC = () => {
    const { yachts, loading } = useTopYachts();

    if (loading) {
        return <div>Loading...</div>;
    }

    return(
        <div className={styles.comp_body}>
            <div className={styles.hero_body}>
              <div className={styles.hero_left}>
                <div className={styles.hero_head}>
                  Powering Network Management
                </div>
                <div className={styles.hero_subhead}>
                Manage multiple agents under your network, assign yachts, and customize commission 
                structures with ease. Streamline your operations and maximize efficiency effortlessly.
                </div>
                <Link to="/signup">
                  <div className={styles.hero_btn}>
                  Start Now
                  </div>
                </Link>
              </div>
              <div className={styles.hero_right}>

              <div className={styles.hero_box2}>
                <img src={hh3} className={styles.hh2} />
              </div>
              </div>
            </div>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>
                   Yacht Near You
                </div>
                <div className={styles.yatch_slider}>
                <Swiper
                  spaceBetween={10}
                  slidesPerView={3.2}
                  pagination={{ clickable: true }}
                  style={{ padding: "20px 0", width:"100%" }}
                >
                  {yachts.map((yacht) => (
                    <SwiperSlide key={yacht._id}>
                        <YachtCard
                          key={yacht._id}
                          yachtId={yacht._id}
                          name={yacht.name}
                          capacity={yacht.capacity}
                          startingPrice={`$${yacht.price.sailing.nonPeakTime}`}
                          images={yacht.images}  
                          listStatus={yacht.isVerifiedByAdmin || "requested"} 
                        />
                    </SwiperSlide>
                  ))}
                </Swiper>
                </div>
            </div>
            <div className={styles.yatchBox}>
              <div className={styles.section_head2}>
                Effortless Distribution
              </div>
              <div className={styles.section_head}>
                Seamless Yacht Distribution Solutions
              </div>
              <div className={styles.gridBox}>
                {solutionData.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    heading={solution.heading}
                    subheading={solution.subheading}
                  />
                ))}
              </div>
            </div>           
        </div>
    )
}

export default Home;