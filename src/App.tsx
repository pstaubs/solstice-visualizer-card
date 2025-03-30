/* eslint-disable @typescript-eslint/no-namespace */
import React, { useRef } from "react";
import { ReactCardProps } from "./utilities/createReactCard";
import Visualizer from "./components/Visualizer";
import './index.css';


declare global {
	namespace JSX {
		interface IntrinsicElements {
			"ha-card": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
		}
	}
}

function App({ config, hass }: ReactCardProps) {
	const renderRef = useRef(0);
	renderRef.current++;

	var data
	try{ data = (hass.value as any).states[(config.value as any)?.zone] }
	catch{ data = null}

	return (
		<ha-card style={{ padding: "1rem" }}>
			{data!=null && <Visualizer lat={data.attributes.latitude} lng={data.attributes.longitude}/>}
		</ha-card>
	);
}

export default App;
