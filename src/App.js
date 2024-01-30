import React, { useState, useEffect } from 'react';
import KakaoMap from './components/KakaoMap';

//TODO 음식점등록 클릭했을 때, 지도 로드 되면서 중심좌표로 이동하는 버그
//TODO 리펙토링
const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showRestaurantPopup, setShowRestaurantPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: ''
  });

  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/selectRestaurantAll');
      if (!response.ok) {
        throw new Error('서버 통신 오류');
      }
      const data = await response.json();

      // const data = [
      //   { id: 1, name: '신촌설렁탕', latitude: 37.557057, longitude: 126.973621 }
      // ];

      setRestaurants(data);
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
    }
  };

  const handleMapClick = (latitude, longitude) => {
    if (showRestaurantPopup) {
      setFormData({ ...formData, latitude, longitude });
    }
  };

  // 음식점 등록 버튼 클릭 시 팝업 상태 업데이트
  const openRestaurantPopup = (event) => {
    
    setShowRestaurantPopup(true);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      // 다른 필드들도 초기화 필요한 경우 여기에 추가
    });
    event.stopPropagation();

    // console.log(showRestaurantPopup); // 상태 로그 출력
  };

  useEffect(() => {
    console.log('showRestaurantPopup 상태:', showRestaurantPopup);
  }, [showRestaurantPopup]);

  useEffect(() => {
    
    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.latitude = parseFloat(formData.latitude);
    formData.longitude = parseFloat(formData.longitude);

    const response = await fetch('http://127.0.0.1:8080/restaurantEntry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      console.log('Data submitted successfully');
      setShowRestaurantPopup(false);
      // 첫 번째 요청이 성공적으로 완료되면, 두 번째 요청을 실행
      const selectResponse = await fetch('http://127.0.0.1:8080/selectRestaurantAll');
      if (!selectResponse.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const updatedRestaurants = await selectResponse.json();

      // restaurants 상태 업데이트
      setRestaurants(updatedRestaurants);

      // 폼 데이터 초기화
      setFormData({
        name: '',
        latitude: '',
        longitude: ''
      });


    } else {
      console.error('Failed to submit data');
      // 에러 처리 로직을 추가할 수 있습니다.
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
        <h1>My Kakao Map</h1>
        <div>
          <button onClick={() => setShowPopup(true)} style={{ /* 스타일 */ }}>방문</button>
          <button onClick={openRestaurantPopup} style={{ /* 스타일 */ }}>음식점 등록</button>
        </div>
      </div>
      {showPopup && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
          width: '400px', 
          zIndex: 1000, // z-index 추가
        }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>X</button>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label>음식점: <input type="text" name="restaurant" value={formData.restaurant} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>위도: <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>경도: <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>맛: <input type="text" name="taste" value={formData.taste} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>간날짜: <input type="date" name="visitDate" value={formData.visitDate} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>거리: <input type="text" name="distance" value={formData.distance} onChange={handleInputChange} /></label>
            </div>
            <div>
              <label>평가: <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} /></label>
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>등록</button>
          </form>
        </div>
      )}
      {showRestaurantPopup && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
          width: '400px', 
          zIndex: 1000
        }}>
          <button onClick={() => setShowRestaurantPopup(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>X</button>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '80px' }}>이름:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '80px' }}>위도:</label>
              <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ width: '80px' }}>경도:</label>
              <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} style={{ flex: 1 }} />
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>등록</button>
          </form>
        </div>
      )}
      <KakaoMap restaurants={restaurants} fetchRestaurants={fetchRestaurants} onMapClick={handleMapClick} />
    </div>
  );
};

export default App;
