import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import styles from "./ManageSchedule.module.css";
import backArrow from "../../assets/icon/back-arrow.svg";
import moreArrow from "../../assets/icon/more-arrow.svg";
import SelectedState from "../../components/SelectedState/SelectedState.jsx";
import ScheduleDetailModal from "../../components/Modal/ScheduleDetailModal.jsx";

export default function ManageSchedule() {
  const navigate = useNavigate();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const dummySchedule = {
    isFixed: false,
    title: "스픽 공부하기",
    category: { color: "#F4ECC8", name: "공부" },
    importance: 3,
    date: "2026-05-20",
    time: null,
    location: "집",
    des: "집에서 공부하기",
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <SelectedState selected="선택한 값" />
        <div className={styles.pageTitleWrapper}>
          <img
            src={backArrow}
            alt="뒤로가기"
            onClick={() => {
              navigate("/today");
            }}
          />
          <span>일정 관리</span>
        </div>
        <div className={styles.cardListContainer}>
          <div>
            <div
              className={styles.categoryWrapper}
              style={{ backgroundColor: "#EEDBDF" }}
            >
              <div className={styles.categoryName}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: "#EEDBDF" }}
                ></div>
                <span>카테고리명</span>
              </div>
            </div>
            <div
              className={styles.scheduleListContainer}
              style={{ backgroundColor: "#F5ECEE" }}
            >
              <div className={styles.scheduleItem}>
                <span>스위치온 개발</span>
                <span>선물 포장</span>
                <span>꿀잠 자기</span>
              </div>
              <img
                src={moreArrow}
                alt="더보기"
                onClick={() => setIsDetailOpen(true)}
              />
            </div>
          </div>

          <div>
            <div
              className={styles.categoryWrapper}
              style={{ backgroundColor: "#F4ECC8" }}
            >
              <div className={styles.categoryName}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: "#F4ECC8" }}
                ></div>
                <span>카테고리명</span>
              </div>
            </div>
            <div
              className={styles.scheduleListContainer}
              style={{ backgroundColor: "#FCFAEE" }}
            >
              <div className={styles.scheduleItem}>
                <span>스위치온 개발</span>
                <span>선물 포장</span>
                <span>꿀잠 자기</span>
              </div>
              <img src={moreArrow} alt="더보기" />
            </div>
          </div>

          <div>
            <div
              className={styles.categoryWrapper}
              style={{ backgroundColor: "#D4E4F1" }}
            >
              <div className={styles.categoryName}>
                <div
                  className={styles.categoryDot}
                  style={{ backgroundColor: "#D4E4F1" }}
                ></div>
                <span>카테고리명</span>
              </div>
            </div>
            <div
              className={styles.scheduleListContainer}
              style={{ backgroundColor: "#EFF6FC" }}
            >
              <div className={styles.scheduleItem}>
                <span>스위치온 개발</span>
                <span>선물 포장</span>
                <span>꿀잠 자기</span>
              </div>
              <img src={moreArrow} alt="더보기" />
            </div>
          </div>
        </div>
        {isDetailOpen && (
          <ScheduleDetailModal
            {...dummySchedule}
            onEdit={() => setIsDetailOpen(false)}
            onClose={() => setIsDetailOpen(false)}
          />
        )}
      </div>
    </>
  );
}
