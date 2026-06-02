import { useEffect, useState } from "react";
import styles from "./CategorySelectModal.module.css";

export default function CategorySelectModal({ onClose, onSelect }) {
  const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${BASE_URL}/category/read`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const categoryList =
          data?.categories || data?.data || data?.result || data;

        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (error) {
        console.error("카테고리 조회 실패:", error);
        alert("카테고리 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>카테고리 목록</span>
        </div>

        {isLoading && <span className={styles.message}>불러오는 중...</span>}
        {!isLoading && categories.length === 0 && (
          <span className={styles.message}>카테고리가 없습니다.</span>
        )}
        {!isLoading &&
          categories.map((category) => (
            <button
              key={category.categoryId}
              type="button"
              className={styles.categoryItem}
              onClick={() => {
                onSelect(category);
                onClose();
              }}
            >
              <div
                className={styles.categoryItemDot}
                style={{
                  backgroundColor: category.categoryColor,
                }}
              ></div>

              <span>{category.categoryName}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
