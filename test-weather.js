const lat = 9.5916, lng = 76.5222;
const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;

async function test() {
  try {
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      console.log('Open-Meteo Not OK:', weatherRes.status);
      console.log(await weatherRes.text());
      return;
    }
    const weatherData = await weatherRes.json();
    console.log('Open-Meteo Success:', typeof weatherData);
    
    const { current, daily } = weatherData;
    console.log('current:', !!current, 'daily:', !!daily);
    
    if (daily) {
       console.log('daily.time:', !!daily.time);
    }
  } catch (e) {
    console.log('Error:', e);
  }
}
test();
