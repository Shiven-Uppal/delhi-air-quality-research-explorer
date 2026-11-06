import { Component, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { scenarios, stations } from './data/stations';

type ScenarioKey = keyof typeof scenarios;
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ramp = (value: number) => {
  const p = Math.max(0, Math.min(1, (value - 40) / 120));
  return p < .2 ? '#f5d76e' : p < .4 ? '#f4a340' : p < .6 ? '#eb6b38' : p < .8 ? '#c6473b' : '#7e2639';
};

function App() {
  const [intro, setIntro] = useState(true);
  const [leavingIntro, setLeavingIntro] = useState(false);
  const [stationName, setStationName] = useState(stations[0].name);
  const [scenario, setScenario] = useState<ScenarioKey>('typical');
  const [origin, setOrigin] = useState(10);
  const [query, setQuery] = useState('');
  const station = stations.find((item) => item.name === stationName) ?? stations[0];
  const config = scenarios[scenario];
  const displayedStations = stations.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()));
  const hourFactor = (hour: number) => .72 + .26 * Math.cos(((hour - 2) / 24) * Math.PI * 2);
  const stationValues = stations.map(item => Math.round(item.base * config.factor * hourFactor(origin)));
  const stationMin = Math.min(...stationValues); const stationMax = Math.max(...stationValues);
  const forecast = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const observed = Math.round(station.base * config.factor * hourFactor(origin));
    const model = Math.round(observed * (1 - 0.12 * (i / 6)) + Math.sin(i + station.phase) * 5);
    const persistence = Math.round(observed + Math.sin(i * .65 + station.phase) * 3);
    const lower = i === 0 ? model : model - 16; const upper = i === 0 ? model : model + 16;
    return { hour: i === 0 ? `Origin (${String(origin).padStart(2,'0')}:00)` : `+${i}h`, model, persistence, lower, upper, interval: upper - lower };
  }), [station, config, origin]);
  const yMin = Math.max(0, Math.floor((Math.min(...forecast.map(d => Math.min(d.lower, d.persistence))) - 8) / 20) * 20);
  const yMax = Math.ceil((Math.max(...forecast.map(d => Math.max(d.upper, d.persistence))) + 8) / 20) * 20;
  const yTicks = Array.from({length: (yMax - yMin) / 20 + 1}, (_, i) => yMin + i * 20);
  const monthly = months.map((month, i) => ({ month, value: Math.round(45 + ((Math.cos((i - 1) * .52) + 1) * 33 + station.base / 8)) }));
  const heat = Array.from({ length: 7 }, (_, day) => Array.from({ length: 24 }, (_, hour) => {
    const overnightCycle = hourFactor(hour);
    const weekdayEffect = day >= 5 ? (day === 5 ? .94 : .92) : [1.03, 1.01, 1, .99, 1.02][day];
    return { hour, day, value: Math.round(station.base * config.factor * overnightCycle * weekdayEffect) };
  }));
  const heatValues = heat.flat().map(item => item.value); const heatMin = Math.min(...heatValues); const heatMax = Math.max(...heatValues);
  const delta = forecast[6].persistence - forecast[6].model;
  const deltaLabel = delta === 0 ? 'Matches persistence' : delta > 0 ? `Model is ${delta} µg/m³ below baseline` : `Model is ${Math.abs(delta)} µg/m³ above baseline`;
  const enterExplorer = () => {
    setLeavingIntro(true);
    window.setTimeout(() => {
      setIntro(false);
      window.requestAnimationFrame(() => document.getElementById('top')?.scrollIntoView());
    }, 650);
  };
  return <main>{intro && <GlobeIntro leaving={leavingIntro} onEnter={enterExplorer}/>}<style>{`.unit-label{margin:8px 0 12px;color:#d4e0eb;font-size:.84rem}.controls input::placeholder{color:#aebfd0;opacity:1;font-weight:400}.search-wrap{position:relative}.search-wrap:before{content:'⌕';position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#c2d3e2;font-size:1.1rem}.search-wrap input{padding-left:35px}.clear-search{position:absolute;right:7px;bottom:7px;border:0;background:#29425d;color:#dbe7f1;border-radius:4px;padding:5px 8px;cursor:pointer}.result-note{font-size:.92rem}.station-dot{cursor:pointer}.station-dot:hover{box-shadow:0 0 0 5px #ffffff44}.ramp-legend{font-size:.78rem}.heatmap .selected-hour{outline:2px solid #f7fbff;outline-offset:1px;box-shadow:0 0 0 2px #08111f;z-index:1}.mini-band{height:125px;position:relative;margin:20px 0 10px;border-bottom:1px solid #4b6984;overflow:hidden}.mini-band:before{content:'';position:absolute;inset:19px 0 18px;background:linear-gradient(160deg,transparent 6%,#7dd3fc33 30%,#7dd3fc77 60%,transparent 88%);clip-path:polygon(0 47%,20% 38%,40% 26%,60% 36%,80% 20%,100% 35%,100% 75%,80% 66%,60% 80%,40% 66%,20% 72%,0 58%)}.mini-band:after{content:'';position:absolute;left:0;right:0;top:52px;height:4px;background:#7dd3fc;clip-path:polygon(0 52%,20% 43%,40% 32%,60% 44%,80% 26%,100% 40%,100% 100%,80% 100%,60% 100%,40% 100%,20% 100%,0 100%)}nav{position:sticky;top:0;z-index:20;background:#08111fee;backdrop-filter:blur(12px)}.back-top{display:inline-block;margin-top:14px;color:#7dd3fc;text-decoration:none;font-size:.85rem}@media(max-width:760px){.heatmap{gap:2px}.map-area{min-width:0}.pattern-card{overflow:hidden}.heat-hours{margin-left:31px}.back-top{font-size:.9rem}}`}</style>
    <nav><a className="brand" href="#top">Delhi Air <span>Observatory</span></a><div><a href="#explore">Explorer</a><a href="#patterns">Patterns</a><a href="#method">Research notes</a></div></nav>
    <section id="top" className="hero"><div><p className="eyebrow">FIELD NOTE 01 · DELHI · 2026</p><h1>Delhi’s air is not <span style={{whiteSpace:'nowrap'}}>one number.</span></h1><p className="lede">It changes by neighbourhood and hour. This interactive research brief examines how a six-hour PM₂.₅ model compares with the simplest forecast: assuming nothing changes.</p><div className="metrics"><Metric value="31" label="Monitoring sites"/><Metric value="6 hr" label="Forecast horizon"/><Metric featured value="−25.1%" label="MAE vs persistence"/><Metric value="32.05" label="µg/m³ study MAE"/></div><p className="result-note">A model earns trust by beating a meaningful baseline—not by looking certain.</p></div><div className="hero-preview" style={{paddingTop:20,paddingBottom:20}}><p className="eyebrow">SIX-HOUR STUDY</p><strong>Forecasting, not live monitoring.</strong><div className="mini-band" style={{filter:'brightness(1.25) saturate(1.2)'}}/><small>An abstract forecast with a labelled uncertainty interval</small></div></section>
    <section id="explore" className="panel"><div className="section-title"><p className="eyebrow">STATION EXPLORER</p><h2>Explore a station</h2><p>How to read this: choose a station and forecast origin; use the map for spatial comparison, then compare the forecast with persistence below.</p></div><div className="explorer-grid"><div className="map-card"><div className="chart-heading"><span>DELHI · SCHEMATIC STATION LAYOUT</span><span className="tag">Illustrative PM₂.₅</span></div><div className="map-area">{stations.map((item) => { const value = Math.round(item.base * config.factor * hourFactor(origin)); return <button key={item.name} onClick={() => setStationName(item.name)} className={`station-dot ${item.name === station.name ? 'selected' : ''}`} style={{left:`${item.x}%`,top:`${item.y}%`, backgroundColor:ramp(value)}} aria-label={`Choose ${item.name}: ${value} micrograms per cubic metre`} title={`Click to select ${item.name}: ${value} µg/m³`} />})}<div className="map-water">Yamuna</div><div className="map-caption"><strong>{station.name}</strong><span>{station.area} · {Math.round(station.base * config.factor * hourFactor(origin))} µg/m³</span></div></div><div className="ramp-legend"><span>40</span><i/><i/><i/><span>100</span><i/><i/><span>160 µg/m³</span></div><small>Fixed 40–160 µg/m³ scale · click a dot to select a station. Values are not live or regulatory data.</small></div><div className="controls"><label>Find station<input type="search" placeholder="Search 31 stations" value={query} onChange={(e) => setQuery(e.target.value)}/></label><label>Station<select value={station.name} onChange={(e) => setStationName(e.target.value)}>{displayedStations.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>Forecast origin <span>{String(origin).padStart(2,'0')}:00</span><input type="range" min="0" max="23" value={origin} onChange={(e) => setOrigin(Number(e.target.value))}/></label><div className="scenario-buttons">{(Object.keys(scenarios) as ScenarioKey[]).map((key) => <button className={scenario === key ? 'active' : ''} onClick={() => setScenario(key)} key={key}>{scenarios[key].label}</button>)}</div><p className="callout">The interval is an illustrative 80% uncertainty band, not a guarantee of future air quality.</p></div></div></section>
    <section className="forecast-section"><div className="section-title"><p className="eyebrow">SIX-HOUR OUTLOOK</p><h2><span style={{whiteSpace:'nowrap'}}>{station.name}</span>{' · '}<span style={{whiteSpace:'nowrap'}}>{config.label.toLowerCase()}</span></h2><p>Model forecast versus the persistence baseline: assuming the next values remain like the latest observation.</p></div><div className="chart-card"><div className="chart-heading"><strong>PM₂.₅ concentration</strong><span>Illustrative station profile</span></div><p className="unit-label">Values in µg/m³ · Persistence baseline = assume the latest observation remains unchanged.</p><ResponsiveContainer width="100%" height={340}><ComposedChart data={forecast} margin={{ top: 12, right: 18, left: 2, bottom: 22 }}><CartesianGrid strokeDasharray="3 3" stroke="#31445c" vertical={false}/><XAxis dataKey="hour" dy={8} tick={{fill:'#d7e2ec',fontSize:12}} tickLine={false} axisLine={false}/><YAxis domain={[yMin,yMax]} ticks={yTicks} allowDataOverflow tick={{fill:'#d7e2ec',fontSize:12}} tickLine={false} axisLine={false} width={46}/><Tooltip contentStyle={{background:'#0c1930',border:'1px solid #344963',borderRadius:8}} labelStyle={{color:'#eaf2fa'}}/><Legend wrapperStyle={{paddingTop:12,color:'#e1ebf4'}}/><Area type="monotone" dataKey="lower" stackId="interval" stroke="none" fill="transparent" name="" legendType="none"/><Area type="monotone" dataKey="interval" stackId="interval" stroke="none" fill="#7dd3fc" fillOpacity={.2} name="80% interval"/><Line type="monotone" dataKey="model" name="Model forecast" stroke="#63c5f1" strokeWidth={3}/><Line type="monotone" dataKey="persistence" name="Persistence baseline" stroke="#c3cedc" strokeDasharray="7 5" strokeWidth={2}/></ComposedChart></ResponsiveContainer><div className="comparison"><div><span>Model estimate at +6h</span><strong>{forecast[6].model} µg/m³</strong></div><div><span>{deltaLabel}</span><strong>{Math.abs(delta)} µg/m³</strong></div><div><span>Illustrative 80% interval</span><strong>{forecast[6].lower}–{forecast[6].upper}</strong></div></div><p className="chart-note">The −25.1% MAE result is an average across stations and forecast origins; a single forecast can overlap the persistence baseline.</p></div></section>
    <section id="patterns" className="panel patterns"><div className="section-title"><p className="eyebrow">HISTORICAL PATTERN LENS</p><h2>PM₂.₅ peaks in winter and overnight.</h2><p>These patterns make clear why a forecast needs both season and time-of-day context. They are generated from an illustrative station profile.</p></div><div className="pattern-grid"><article className="pattern-card"><div className="chart-heading"><strong>Seasonal profile</strong><span className="tag">Illustrative</span></div><div className="bar-wrap"><div className="bar-axis"><span>180</span><span>120</span><span>60</span><span>0</span></div><div className="month-bars">{monthly.map(({month,value}) => <div key={month} title={`${month}: ${value} µg/m³`}><span style={{height:`${Math.min(100,value/1.8)}%`,background:ramp(value)}}/><small>{month}</small></div>)}</div></div><p className="chart-note">Monthly average PM₂.₅ concentration · µg/m³ · fixed 40–160 colour scale</p></article><article className="pattern-card"><div className="chart-heading"><strong>Weekly hourly pattern</strong><span className="tag">Illustrative</span></div><div className="heat-wrap"><div className="heat-y">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d}>{d}</span>)}</div><div className="heatmap">{heat.flat().map(({hour,day,value}) => <button key={`${hour}-${day}`} type="button" onClick={() => setOrigin(hour)} className={hour === origin ? 'selected-hour' : ''} style={{background:ramp(value),border:0,padding:0,borderRadius:2,cursor:'pointer'}} aria-label={`Set forecast origin to ${String(hour).padStart(2,'0')}:00; ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day]} profile is ${value} micrograms per cubic metre`} title={`${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day]} ${String(hour).padStart(2,'0')}:00 · ${value} µg/m³`}/>)}</div></div><div className="heat-hours"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div><div className="ramp-legend compact"><span>40</span><i/><i/><i/><span>100</span><i/><i/><span>160 µg/m³</span></div><p className="chart-note">Fixed colour scale · outlined column = selected forecast origin · hover or tap cells for values</p></article></div></section>
    <section id="method" className="method"><p className="eyebrow">METHODOLOGY & LIMITS</p><h2>What this model can{'⁠'}—and cannot—claim.</h2><div className="method-grid"><article><span className="card-icon">↗</span><h3>It can help frame location-specific questions.</h3><p>The study tests whether a six-hour predictive model improves on persistence across Delhi stations. Its evaluation reported a 32.05 µg/m³ MAE and a 25.1% reduction against persistence.</p><small>So what: compare a model against a meaningful baseline.</small></article><article><span className="card-icon">!</span><h3>It cannot guarantee conditions or give health advice.</h3><p>Weather, emissions, exceptional events, and incomplete station coverage can shift conditions quickly. This explorer is not a live monitoring dashboard.</p><small>So what: use official monitoring for decisions about exposure.</small></article></div><ul><li><strong>Illustrative profiles:</strong> station, seasonal, and hourly values shown here are not a downloadable source dataset.</li><li><strong>Forecast comparison:</strong> model prediction versus persistence baseline, with a labelled uncertainty interval.</li><li><strong>Colour:</strong> the fixed 40–160 µg/m³ yellow-to-maroon ramp supports comparison across the map, seasonal bars, and heatmap; it does not represent AQI health categories.</li><li>The related research also studies a spatial advection–diffusion–reaction framework; its calibration is distinct from the displayed forecast metric.</li></ul></section>
    <footer>Delhi Air Observatory · PM₂.₅ Forecasting Research Explorer · Built by Shiven Uppal · Not for health, emergency, or regulatory decisions.<br/><a className="back-top" href="#top">Back to top ↑</a></footer>
  </main>;
}
function GlobeIntro({ leaving, onEnter }: { leaving: boolean; onEnter: () => void }) {
  return <section className={`globe-intro ${leaving ? 'leaving' : ''}`} aria-label="Enter Delhi Air Observatory">
    <div className="intro-noise" aria-hidden="true"/>
    <header className="intro-nav"><span><i/> DELHI AIR OBSERVATORY</span><button type="button" onClick={onEnter}>Skip intro <b>↓</b></button></header>
    <div className="globe-stage" aria-hidden="true">
      <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
      <div className="globe-canvas"><GlobeCanvasBoundary><Canvas camera={{ position: [0, 0, 5.3], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><GlobeScene zooming={leaving}/></Canvas></GlobeCanvasBoundary></div><span className="globe-label">Delhi, India</span>
    </div>
    <div className="intro-copy">
      <p className="intro-kicker">PM₂.₅ · DELHI · RESEARCH EXPLORER</p>
      <h1>One atmosphere.<br/><i>One city.</i></h1>
      <p>Pollution moves across borders. Exposure happens on particular streets, at particular hours.</p>
      <button type="button" className="enter-delhi" onClick={onEnter}>Enter Delhi <span>↘</span></button>
    </div>
    <p className="intro-caption">31 monitoring sites · six-hour forecasting study · illustrative data</p>
  </section>
}

function latLng(lat: number, lng: number, radius = 1.025) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

class GlobeCanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="globe-fallback" aria-hidden="true"><i/><b/></div> : this.props.children; }
}

function GlobeScene({ zooming }: { zooming: boolean }) {
  const group = useRef<THREE.Group>(null);
  const marker = latLng(28.6139, 77.2090);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (zooming ? 0.02 : 0.075);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, zooming ? -0.12 : 0.06, 2.2, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, zooming ? 2.5 : 5.3, 2.4, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return <>
    <ambientLight intensity={1.4}/><directionalLight position={[-3, 2, 4]} intensity={2.1} color="#dbe8d9"/><pointLight position={[3, -2, 2]} intensity={3.2} color="#e05a2c"/>
    <group ref={group} rotation={[0.06, -1.7, 0]}>
      <mesh><sphereGeometry args={[1, 64, 64]}/><meshStandardMaterial color="#1b403a" roughness={.72} metalness={.08}/></mesh>
      <mesh scale={1.006}><sphereGeometry args={[1, 28, 18]}/><meshBasicMaterial color="#a9c7ae" wireframe transparent opacity={.18}/></mesh>
      <mesh scale={1.045}><sphereGeometry args={[1, 64, 64]}/><meshBasicMaterial color="#a7dec0" transparent opacity={.07} side={THREE.BackSide}/></mesh>
      <mesh position={marker}><sphereGeometry args={[.034, 18, 18]}/><meshBasicMaterial color="#f0713f"/></mesh>
      <mesh position={marker.clone().multiplyScalar(.998)}><ringGeometry args={[.07, .078, 32]}/><meshBasicMaterial color="#f0713f" transparent opacity={.72} side={THREE.DoubleSide}/></mesh>
    </group>
  </>;
}

function Metric({value,label,featured=false}:{value:string;label:string;featured?:boolean}) { return <div className={featured ? 'featured' : ''}><strong>{value}</strong><span>{label}</span></div>; }
export default App;
