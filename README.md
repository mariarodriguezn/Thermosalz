<p align="center">
  <img src="https://github.com/mariarodriguezn/Thermosalz/blob/main/Web%20App/Thermosalz.jpg?raw=true" alt="Thermosalz logo" width="500"/>
</p>

## Description
Thermosalz is an interactive Web Application created with Open Layers to display Land Surface Temperature (LST) changes during the summer seasons between 2018 to 2022 in Salzburg, using Ecostress Satellite Imagery and Hexagonal Grids for Zonal Statistics.

## Web App Capabilities
- **TEMPERATURE:** Visualize Summer Annual Composites layers displaying the LST (°C) median values for Salzburg.
- **HEXAGONAL BINS:** Click on the Hexagons to enable a pop-up showing the spatially aggregated LST (°C) values by mean.
- **SWIPE:** Compare the Annual Composites layers with the spatially aggregated hexagons by using the swipe.
- **LOCATE:** Look for a place in Salzburg with the search button or using the bookmarks.


## Website

To check for the final Web App and how to use it, please access the following website: [Thermosalz](https://rawcdn.githack.com/mariarodriguezn/Thermosalz/e347503b59eb9ef3b585cc63dda23f94cdc9df2c/Website/Home.html)

<p align="center">
  <a href="https://rawcdn.githack.com/mariarodriguezn/Thermosalz/e347503b59eb9ef3b585cc63dda23f94cdc9df2c/Website/Home.html"><img src="https://github.com/mariarodriguezn/Thermosalz/blob/main/Website/images/Thermosalz_Website1.jpg?raw=true" alt="Website1" width="800"/>
</p>
<p align="center">
  <a href="https://rawcdn.githack.com/mariarodriguezn/Thermosalz/e347503b59eb9ef3b585cc63dda23f94cdc9df2c/Website/Home.html"><img src="https://github.com/mariarodriguezn/Thermosalz/blob/main/Website/images/Thermosalz_Website2.jpg?raw=true" alt="Website2" width="800"/>
</p>

## How Thermosalz was created?
<p align="center">
  <img src="https://github.com/mariarodriguezn/Thermosalz/blob/main/Website/images/Methodology.jpg?raw=true" alt="Methodology" width="800"/>
</p>

## Repository Structure

The repository is based on the following directory structure:

1. [Web App](https://github.com/mariarodriguezn/Thermosalz/tree/main/Web%20App): Thermosalz Web App source code.

2. [Website](https://github.com/mariarodriguezn/Thermosalz/tree/main/Website): Source code of the created Website with the objective of embedding Thermosalz Web App, explaining its capabilities through a video demonstration and listing its data sources.

3. [tools](https://github.com/mariarodriguezn/Thermosalz/tree/main/tools): Python modules developed to generate the layers (Ecostress Annual Summer Composites and Hexagons) used in Thermosalz Web App and their associated environment. It also contains Jupyter Notebooks demonstrating the specific step-by-step followed.

| Module            | Required Environment | Demo Notebook |
| :---------------: | :------------------: | :-----------: |
| [ECOSTRESS.py](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/ECOSTRESS.py)   |   [ecostress.yml](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/ecostress.yml)     | [Example_ECOSTRESS.ipynb](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/Example_ECOSTRESS.ipynb)|
| [HEXAGONS.py](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/HEXAGONS.py)       |   [hexagons.yml](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/hexagons.yml)    | [Example_HEXAGONS.ipynb](https://github.com/mariarodriguezn/Thermosalz/blob/main/tools/Example_HEXAGONS.ipynb) |
