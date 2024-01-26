import React, { useEffect } from 'react';

const KakaoMap = () => {
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
            });
        };
    }, []);

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
