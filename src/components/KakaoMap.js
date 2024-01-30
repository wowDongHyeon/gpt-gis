import React, { useEffect } from 'react';

const KakaoMap = ({restaurants}) => {
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

                restaurants.forEach(restaurant => {
                    const markerPosition  = new window.kakao.maps.LatLng(restaurant.latitude, restaurant.longitude);
                    const marker = new window.kakao.maps.Marker({
                        position: markerPosition
                    });
                    marker.setMap(map);

                    // 커스텀 오버레이에 표시할 내용
                    const overlayContent = `<div style="padding:5px;background:white;border:1px solid black;border-radius:4px;">${restaurant.name}</div>`;

                    // 커스텀 오버레이 생성
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position: markerPosition,
                        content: overlayContent,
                        yAnchor: 2.3
                    });

                    // 커스텀 오버레이를 지도에 표시
                    customOverlay.setMap(map);
                });
            });
        };
    }, [restaurants]);

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
