# Thermosalz
An interactive web application for visualizing Land Surface Temperature (LST) changes in Salzburg

## Main Objective
Develop a Web Application with Open Layers to display Land Surface Temperature (LST) changes during the summer seasons between 2018 to 2022 in Salzburg, using Ecostress Satellite Imagery and Hexagonal Grids for Zonal Statistics.

## Secondary Objectives
- Create a GitHub repository for facilitating collaborative work and versioning control.
- Develop a Python script to: 
	- Automate the download of Ecostress data bundles for each summer. 
	-  Process Ecostress Imagery by applying cloud masking and calculating LST (°C) 
	- Create Summer Median Composites for each summer. 
	- Implement a Hexagonal Grid which aggregates LST pixels values by mean. 
- Serve Raster composites and Hexagonal Grid through Amazon S3 free tier bucket.

## Work Breakdown Structure
![Work Breakdown Structure](https://drive.google.com/uc?export=view&id=19oLDjASjlcvH8FmT-Kyv8Ad0RjylfPMz)
