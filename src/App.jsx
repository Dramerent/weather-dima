import { useState, useEffect } from 'react';
import './App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Пермь');
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);


  
  useEffect(() => {
    if (city) {
      
      fetch(`http://api.weatherapi.com/v1/current.json?key=9dec154c90a94b54a9094816240706&q=${city}&aqi=no&lang=ru`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Сетевой ответ был не ok.');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.current) {
            setWeather(data);
          } else {
            throw new Error('Данные о погоде не найдены.');
          }
        })
        .catch(error => {
          console.error('Ошибка при получении данных о погоде:', error);
          setWeather(null); // Сброс состояния погоды
        });
    }
  }, [city]);
  

  useEffect(() => {
    if (city) {
      fetch(`http://api.weatherapi.com/v1/forecast.json?key=9dec154c90a94b54a9094816240706&q=${city}&hours=24&lang=ru`)
        .then(response => response.json())
        .then(data => {
          if (data && data.forecast && data.forecast.forecastday) {
            setHourlyForecast(data.forecast.forecastday[0].hour); // Предполагается, что forecastday[0] - это текущий день
          }
        })
        .catch(error => {
          console.error('Ошибка при получении почасового прогноза:', error);
          setHourlyForecast([]); // Сброс состояния почасового прогноза
        });
    }
  }, [city]); // Зависимость от city, чтобы обновлять прогноз при смене города


  useEffect(() => {
    if (city) {
      // Fetch the 10-day forecast at 15:00 hours
      fetch(`http://api.weatherapi.com/v1/forecast.json?key=9dec154c90a94b54a9094816240706&q=${city}&days=10&hour=15&lang=ru`)
        .then(response => response.json())
        .then(data => {
          if (data && data.forecast && data.forecast.forecastday) {
            // Extract the forecast for 15:00 hours from each day
            const forecastAt15 = data.forecast.forecastday.map(day => day.hour.find(hour => new Date(hour.time).getHours() === 15));
            setDailyForecast(forecastAt15);
          }
        })
        .catch(error => {
          console.error('Ошибка при получении дневного прогноза:', error);
          setDailyForecast([]); // Сброс состояния дневного прогноза
        });
    }
  }, [city]); // Зависимость от city, чтобы обновлять прогноз при смене города

  const formatTime = (datetime) => {
    return datetime.split(' ')[1]; // Возвращает только время
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  return (
    <div className='BG'>
      
    <h1>Прогноз погоды</h1>
    <div className='MainBlock'>
      <div className='MeinTop'>
        <input className='CityInput' type="text" value={city} onChange={handleCityChange} placeholder="Введите название города"/>
        <p>Все данные берутся с сервиса <span style={{color:"#5498c5", fontWeight:"700"}}>weather API</span></p>
      </div>
      {weather ? (
        <div className="WeatherInfoTotal">
        <div className='CurrentCityInfo'>
          <div className='CurrentCityInfoNow'>
            <p>{weather.location.name}</p>
            <p>{weather.current.temp_c}°C</p>
            <div className='weatherStatys'>
              <p>{weather.current.condition.text}</p>
              <img className='weatherStatysIMG' src={weather.current.condition.icon} alt="" />
            </div>
            <p>Местное время: {formatTime(weather.location.localtime)}</p>
          </div>
          <Swiper

            className='SwiperToday'
            modules={[Navigation, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={15} // Измените на количество слайдов, которое хотите показать одновременно
            
            navigation
            // pagination={{ clickable: true }}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {hourlyForecast.map((hour, index) => (
              <SwiperSlide key={index} style={{maxWidth:"30px"}}>
                <div> 
                  <p >{formatTime(hour.time)}</p>
                  <p >{hour.temp_c}°C</p>
                  <img src={hour.condition.icon} alt={hour.condition.text} />
                  {/* <p>{hour.condition.text}</p> */}
                </div>
              </SwiperSlide>

            ))}
          </Swiper>
        </div>
        <p style={{marginLeft:"38px", marginTop:"10px"}}>Погода на 10 дней</p>
          <Swiper
          className='WeatherTomorowMain'
          
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={5} // Adjust this value as needed for your layout
        navigation
        pagination={{ clickable: true }}
      >
        {dailyForecast.map((forecast, index) => (
          <SwiperSlide key={index} className='WeatherTomorow'>
            <div>
              <p>{new Date(forecast.time).toLocaleDateString()}</p>
              <p>{forecast.temp_c}°C</p>
              <img src={forecast.condition.icon} alt={forecast.condition.text} />
              <p style={{color:"#7a7a7a"}}>{forecast.condition.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
        </div>

        
      ) : (
        <p>Для показапогоды укажите город</p>
      )}
      </div>
    </div>
  );
}

export default App;
