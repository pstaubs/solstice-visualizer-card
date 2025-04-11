# Solstice Visualizer Card

A simple, custom [Home Assistant Dashboard Card](https://www.home-assistant.io/dashboards/), that graphically shows the yearly daytime in relation to the nearest solstice and equinox. Inspired heavily by https://github.com/rejuvenate/lovelace-horizon-card. Hover over the graph to read out the expected amount of daylight hours for that day.

![Screenshot 2025-04-08 203328](https://github.com/user-attachments/assets/b4f5879c-d3ae-4bb7-a889-6020ce5d640f)


## Configuration
General options
Name 	 	Description 	Default
title 	string 	Card title 	Doesn't display a title by default

| Name            | Description     | Accepted values | Default         |
| --------------- | --------------- | --------------- | --------------- |
| zone            | Serves as a refference zone to correctly calculate sunrise and sunset based on your latitude. | string          | ```home.zone``` |


## Development
Run a test environmemnt without home assistant.

```npm run dev```

Building

```npm run build```
