import React from 'react';
import { Seasons, Observer, SearchRiseSet, Body } from 'astronomy-engine'
import * as d3 from "d3";
import dateFormat from 'dateformat';


interface Props {
	lat: number,
	lng: number,
	margin: number,
	marginBottom: number,
	height: number,
	width: number,
	sunRadius:number
}

interface State {
	durations: number[],
	seasons: { date: Date; type: string; }[],
	hoveredDateIndex: number,
}


export default class Visualizer extends React.Component<Props, State> {
	resizeReference = React.createRef<HTMLDivElement>();
	
	static defaultProps = {
		lat:15,
		lng: 0,
		margin: 10,
		marginBottom: 40,
		height: 140,
		width: 460,
		sunRadius: 12
	};

	state:State = {
		durations: [],
		seasons: [],
		hoveredDateIndex: null
	}

	componentDidMount() {
		this.calculate()
		window.addEventListener("resize", ()=>{this.forceUpdate()})
	}



	calculate() {
		const timeline_start_date = new Date()
		timeline_start_date.setMonth(timeline_start_date.getMonth() - 6)
		const timeline_end_date = new Date()
		timeline_end_date.setMonth(timeline_end_date.getMonth() + 6)

		var seasons_years = [
			Seasons(new Date().getFullYear()-1),
			Seasons(new Date().getFullYear()),
			Seasons(new Date().getFullYear()+1)
		]

		var seasons: { date: Date; type: string; }[] = []
		seasons_years.map((season_markers:any)=>{
			['mar_equinox', 'jun_solstice', 'sep_equinox', 'dec_solstice'].map((season_type:string)=>{
				if(season_markers[season_type].date > timeline_start_date && season_markers[season_type].date < timeline_end_date)
				seasons.push({date:season_markers[season_type].date, type:season_type})
			})
		})

		const observer = new Observer(this.props.lat, this.props.lng, 0)
		
		var durations = []
		var date = timeline_start_date
		for (var d = 0; d <= 365; d+=1) {
			date.setDate(date.getDate() + 1)
			durations.push(this.computeRiseSet(observer, date))
		}

		this.setState({
			durations: durations,
			seasons: seasons
		})

	}
	

	computeRiseSet(observer:Observer, date:Date) {
		const sunrise  = SearchRiseSet(Body.Sun,  observer, +1, date, 300);
		const sunset   = SearchRiseSet(Body.Sun,  observer, -1, date, 300);
		var x = (sunset.date.getTime()-sunrise.date.getTime())/1000/3600
		return (x > 0 ? x : x+24)
	}


	dateDiff(date1:Date, date2:Date) {
		return Math.round(( date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
	}


	handleMouseMove(e:React.MouseEvent) {
		const x_ = d3.scaleLinear([this.props.margin, this.getWidth() - this.props.margin], [0, this.state.durations.length - 1]);
		var index = x_(e.nativeEvent.offsetX)
		index = Math.trunc((index > 365 ? 365 : index < 0 ? 0 : index))
		this.setState({hoveredDateIndex:index});
	};


	handleMouseLeave() {
		this.setState({hoveredDateIndex:null});
	};

	getWidth() {
		return Math.min(this.props.width,(this.resizeReference.current ? this.resizeReference.current.offsetWidth : this.props.width))
	}


	render() {
		const width = this.getWidth();

		const y_extents = [d3.extent(this.state.durations)[0]-2, d3.extent(this.state.durations)[1]]
		const x = d3.scaleLinear([0, this.state.durations.length - 1], [this.props.margin, width - this.props.margin]);
		const y = d3.scaleLinear(y_extents, [this.props.height - this.props.marginBottom, this.props.margin]);
		const line = d3.line((_, i) => x(i), y);

		var date = new Date()
		date.setMonth(date.getMonth() - 6)

		
		return (
			<div ref={this.resizeReference } style={{fontSize: '10px'}}>
				<svg
					width={'100%'}
					height={this.props.height}
					onMouseMove={this.handleMouseMove.bind(this)}
					onMouseLeave={this.handleMouseLeave.bind(this)}
					style={{fontFamily: 'var(--primary-font-family)'}}
					>
					{/* The Plot */}
					<path fill="none" stroke="var(--hc-lines)" strokeWidth="1.0px" d={line(this.state.durations)} />

					{/* The Sun */}
					{this.state.hoveredDateIndex===null && <circle stroke="none" fill="var(--hc-sun-color)" cx={x(182.5)} cy={y(this.state.durations[182])} r={this.props.sunRadius}></circle>}

					{/* Tooltips */}
					{this.state.durations.map((datum, index) => {
						if(this.state.hoveredDateIndex===index) {return(
							<g key={index}>
								<text
									fill="currentColor"
									x={x(index)}
									y={y(datum) + 30}
									textAnchor="middle"
								>
									{datum.toFixed(1)} hours
								</text>
								<circle 
									stroke="none"
									fill="var(--hc-sun-color)" 
									cx={x(index)}
									cy={y(datum)}
									style={{ transition: "ease-out .1s" }}
									r={this.props.sunRadius}/>
							</g>
						)}
					})}

					{/* Main axis and lines */}
					<path
						d={["M", x(0), y(y_extents[0]), "L", x(this.state.durations.length), y(y_extents[0])].join(" ")}
						fill="none"
						stroke="var(--hc-lines)"
						strokeWidth="0.25px"
					/>
					<path 
						d={["M", x(this.state.durations.length)-10, y(y_extents[0])-5, "L", x(this.state.durations.length), y(y_extents[0]), "L", x(this.state.durations.length)-10, y(y_extents[0])+5].join(" ")}
						fill="none"
						stroke="var(--hc-lines)"
						strokeWidth="0.25px"
					/>

					{/* Ticks and labels */}
					{this.state.seasons.map((season) => {
						const x_value = this.dateDiff(date, season.date);
						const y_anchor = y(y_extents[0])
						return (
							<g 
								key={season.date.toISOString()}
								transform={`translate(${x(x_value)}, ${y_anchor})`}>
								<line
									y1={-10}
									y2={(y(this.state.durations[x_value]))-y_anchor+10}
									stroke="var(--hc-lines)"
									strokeWidth="0.25px"
								/>
								<line
									y2={6}
									stroke="var(--hc-lines)"
									strokeWidth="0.25px"
								/>
								<text
									style={{
										fill: 'var(--hc-field-value-color)',
										fontSize: '1em',
										textAlign: 'center',
										textAnchor: 'middle',
										transform: 'translateY(20px)',
									}}
								>
									{dateFormat(season.date, "mmmm dS")}
								</text>
								<text
									fill="var(--hc-lines)"
									style={{
										fill: 'var(--hc-field-name-color)',
										fontSize: '0.8em',
										textAlign: 'center',
										textAnchor: 'middle',
										transform: 'translateY(30px)',
									}}
								>
									{season.type.includes('solstice') ? 'Solstice' : 'Equinox'}
								</text>
							</g>
						)}
					)}


					
				</svg>

			</div>
		)
	}
}
