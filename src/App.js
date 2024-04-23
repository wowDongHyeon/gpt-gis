import React, { useState, useEffect } from 'react';
import KakaoMap from './components/KakaoMap';

// TODO 음식점 등록 클릭했을 때, 지도 로드 되면서 중심좌표로 이동하는 버그
// TODO 리펙토링
const App = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showGptPopup, setShowGptPopup] = useState(false);
  const [showRestaurantPopup, setShowRestaurantPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    tastes: '5',
  });

  const handleMarkerClick = (restaurantName) => {
    // restaurants 배열에서 해당 가게 정보 찾기
    const clickedRestaurant = restaurants.find((restaurant) => restaurant.name === restaurantName);
  
    if (clickedRestaurant) {
      setFormData({
        ...formData,
        restaurant: clickedRestaurant.name, // 가게명 설정
        id: clickedRestaurant.id, // 가게 ID 설정
      });
    }
  };

  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/selectRestaurantAll');
      if (!response.ok) {
        throw new Error('서버 통신 오류');
      }
      const data = await response.json();
      setRestaurants(data);
      console.log('가게 정보 저장 응답:', data);
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
    }
  };

  const handleMapClick = (latitude, longitude) => {
    if (showRestaurantPopup) {
      setFormData({ ...formData, latitude, longitude });
    }
    if (showPopup) {
      setFormData({ ...formData, latitude: '', longitude: '' });
    }
  };

  // 방문 팝업창 열릴 때 초기화
  const openVisitPopup = () => {
    setShowPopup(true);
    setFormData({
      ...formData,
      latitude: '',
      longitude: '',
      visitDate: new Date().toISOString().split('T')[0], // 방문일 default로 현재 날짜 설정
    });
  };

  // GPT추천 팝업창 열릴 때 초기화
  const openGptPopup = () => {
    setShowGptPopup(true);
    setFormData({
      ...formData,
      latitude: '',
      longitude: '',
      visitDate: new Date().toISOString().split('T')[0], // 방문일 default로 현재 날짜 설정
    });
  };
  // 음식점 등록 버튼 클릭 시 팝업 상태 업데이트
  const openRestaurantPopup = (event) => {
    setShowRestaurantPopup(true);
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      tastes: '5', // 이 부분을 tastes로 초기화하도록 수정
    });
    event.stopPropagation();
  };

  useEffect(() => {
    console.log('showRestaurantPopup 상태:', showRestaurantPopup);
  }, [showRestaurantPopup]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value !== undefined ? value : '', // 값이 undefined인 경우 빈 문자열로 설정
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    formData.latitude = parseFloat(formData.latitude);
    formData.longitude = parseFloat(formData.longitude);
  
    if (showRestaurantPopup) {
      // 음식점 등록 요청
      const response = await fetch('http://127.0.0.1:8080/restaurantEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        console.log('Restaurant data submitted successfully');
        setShowRestaurantPopup(false);
        setFormData({
          name: '',
          latitude: '',
          longitude: '',
          tastes: '5',
        });
  
        // 음식점 목록 업데이트
        const selectResponse = await fetch('http://127.0.0.1:8080/selectRestaurantAll');
        if (!selectResponse.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const updatedRestaurants = await selectResponse.json();
        setRestaurants(updatedRestaurants);
      } else {
        console.error('Failed to submit restaurant data');
      }
    }
  
    if (showPopup) {
      // 방문 정보 등록 요청
      const visitData = {
        user_id: 'LSK',
        restaurant_id: formData.id,
        visit_date: formData.visitDate,
        taste_rating: formData.tastes,
      };
  
      const visitResponse = await fetch('http://127.0.0.1:8080/visitsEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
  
      if (visitResponse.ok) {
        console.log('Visit data submitted successfully');
        setShowPopup(false);
        setFormData({
          restaurant: '',
          id: '',
          visitDate: '',
          tastes: '5',
        });
      } else {
        console.error('Failed to submit visit data');
      }
    }

    if (showGptPopup) {

        const selectResponse = await fetch('http://127.0.0.1:8080/selectVisitsTextInfoAll');
        if (!selectResponse.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        
        

        const updatedRestaurants = await selectResponse.json();

        const visitTexts = updatedRestaurants
        .map(restaurant => restaurant.visit_text_info)
        .join('\n');


        let prompt = "너는 데이터를 기반으로 음식점을 추천해주는 프로그램이다.\n"
        prompt += "나는 지금 점심을 먹을 식당을 고민하고 있다. 아래 데이터를 기반으로 점심에 갈 음식점을 추천해라. \n";
        prompt += "또한, 추천하는 이유를 간단하게 출력해라. \n";
        prompt += visitTexts;
        prompt += "\n```"
        
        const gptApiResponse = await gptApiRequest(prompt)

        alert(gptApiResponse);
        setShowGptPopup(false);

        
    }
  };

 

    //GPT API 요청
  const gptApiRequest = async (prompt) => {

    console.log(prompt);

    const response = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: prompt
      })
    });

    
  

    const result = await response.json();
    console.log(result);
    return result;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
        <h1>My Kakao Map</h1>
        <div>
          <button onClick={openVisitPopup} style={{ /* 스타일 */ }}>방문</button>
          <button onClick={openRestaurantPopup} style={{ /* 스타일 */ }}>음식점 등록</button>
          <button onClick={openGptPopup} style={{ /* 스타일 */ }}>GPT추천</button>
          
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
              <label>음식점: <input type="text" name="restaurant" value={formData.restaurant} onChange={handleInputChange} readOnly /></label>
            </div>
            <div>
              <label>맛: 
                <select name="tastes" value={formData.tastes} onChange={handleInputChange}>
                  <option value="1">너무 맛없음</option>
                  <option value="2">맛없음</option>
                  <option value="3">보통</option>
                  <option value="4">맛있음</option> 
                  <option value="5">너무 맛있음</option>
                </select>
              </label>
            </div>
            <div>
              <label>방문일: <input type="date" name="visitDate" value={formData.visitDate} onChange={handleInputChange} /></label>
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>등록</button>
          </form>
        </div>
      )}
      {showGptPopup && (
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
          <button onClick={() => setShowGptPopup(false)} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>X</button>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label>GPT가 오늘의 점심 메뉴를 추천해드립니다.</label>
            </div>
           
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>GPT추천</button>
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
      <KakaoMap restaurants={restaurants} fetchRestaurants={fetchRestaurants} onMapClick={handleMapClick} onMarkerClick={handleMarkerClick} />
    </div>
  );
};

export default App;