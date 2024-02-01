import React, { useEffect, useState, useRef } from 'react';

const KakaoMap = ({restaurants, fetchRestaurants, onMapClick, onMarkerClick}) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const mapRef = useRef(null); // Ref 추가

    const deleteRestaurant = async (restaurantId) => {
        try {
          const response = await fetch('http://127.0.0.1:8080/restaurantDelete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ restaurantId }),
          });
     
          if (response.ok) {
            console.log('Restaurant deleted successfully');
            fetchRestaurants(); // 음식점 목록 다시 가져오기
          } else {
            console.error('Failed to delete restaurant');
          }
        } catch (error) {
          console.error('Error:', error);
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f82d0170a2da4ad990e69d935de462ab&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(37.557057, 126.9736211 ), // 중심 좌표 설정
                    level: 2 // 확대 레벨 설정
                };
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map; // Ref에 map 객체 저장

                // 지도 클릭 이벤트 리스너 추가
                window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                    const latlng = mouseEvent.latLng;
                    onMapClick(latlng.getLat(), latlng.getLng());
                });

                restaurants.forEach(restaurant => {
                    const markerPosition  = new window.kakao.maps.LatLng(restaurant.latitude, restaurant.longitude);
                    const marker = new window.kakao.maps.Marker({
                        position: markerPosition
                    });
                    marker.setMap(map);

                    // 커스텀 오버레이에 표시할 내용
                    const overlayContent = `<div style="padding:5px;background:white;border:1px solid black;border-radius:4px;" data-restaurant-id="${restaurant.id}">${restaurant.name}</div>`;

                    // 커스텀 오버레이 생성
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position: markerPosition,
                        content: overlayContent,
                        yAnchor: 2.3
                    });

                    // 커스텀 오버레이를 지도에 표시
                    customOverlay.setMap(map);

                    // 커스텀 오버레이에 이벤트 리스너 추가
                    const overlayDiv = customOverlay.a; // 커스텀 오버레이의 DOM 요소
                    overlayDiv.oncontextmenu = (e) => {
                        e.preventDefault(); // 기본 컨텍스트 메뉴 비활성화
                        
                        const existingMenu = document.getElementById('customContextMenu');

                        if (existingMenu) {
                            existingMenu.parentNode.removeChild(existingMenu);
                        }
                        // 컨텍스트 메뉴 생성 및 표시
                        const contextMenu = document.createElement('div');
                        contextMenu.id = 'customContextMenu';
                        contextMenu.style.position = 'absolute';
                        contextMenu.style.left = `${e.clientX}px`;
                        contextMenu.style.top = `${e.clientY}px`;
                        contextMenu.style.backgroundColor = 'red';
                        contextMenu.style.border = '1px solid #ddd';
                        contextMenu.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.2)';
                        contextMenu.style.padding = '10px';
                        contextMenu.style.borderRadius = '5px';
                        contextMenu.style.zIndex = 10000; // 높은 z-index 값 설정
                        contextMenu.innerHTML = '<div style="cursor: pointer;">삭제</div>';
                        document.body.appendChild(contextMenu);

                        // 컨텍스트 메뉴 클릭 이벤트
                        contextMenu.onclick = () => {
                            const restaurantId = overlayDiv.children[0].getAttribute('data-restaurant-id');
                            deleteRestaurant(restaurantId);
                            document.body.removeChild(contextMenu); // 메뉴 제거
                        };

                        // 다른 곳 클릭 시 컨텍스트 메뉴 제거
                        document.onclick = (event) => {
                            if (event.target !== contextMenu && document.body.contains(contextMenu)) {
                                document.body.removeChild(contextMenu);
                            }
                        };
                    };

                    customOverlay.setMap(map);

                    overlayDiv.onclick = () => {
                        const restaurantName = overlayDiv.children[0].innerText;
                        setSelectedRestaurant(restaurantName);
                    };
                });
            });
        };
    }, [restaurants, fetchRestaurants, onMapClick, onMarkerClick]);

    useEffect(() => {
        if (selectedRestaurant) {
          onMarkerClick(selectedRestaurant);
          setSelectedRestaurant(null); // 선택한 음식점 초기화
        }
    }, [selectedRestaurant, onMarkerClick]);

    return (
        <div 
            id="map" 
            style={{ 
                width: '100vw',    // 뷰포트 너비 전체
                height: '100vh'    // 뷰포트 높이 전체
            }}
        ></div>
    );
};

export default KakaoMap;
