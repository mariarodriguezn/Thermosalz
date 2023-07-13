"""
This module provides functions for generating and analyzing hexagonal grids based on a specified area of interest (AOI) and raster data.

This module requires the following libraries to be installed: `rasterio`, `geopandas`, `h3`, `shapely`, `rasterstats`, `pandas`, and `fiona`.

Functions
---------
create_hexagons_with_statistics(folder_name, aoi_geojson, hexagons_size):
    Create aggregation hexagons within the specified area of interest (AOI) and compute 
    mean Land Surface Temperature (LST) statistics based on COG summer composites.
"""


import rasterio
import geopandas as gpd
from geopandas import GeoSeries
import matplotlib.pyplot as plt
import h3
from shapely.geometry import Polygon
from rasterstats import zonal_stats
import pandas as pd
import fiona
import os


def create_hexagons_with_statistics(folder_name, aoi_geojson, hexagons_size):
    """Create aggregation hexagons within the specified area of interest (AOI) and compute 
    mean Land Surface Temperature (LST) statistics based on COG summer composites.

    This function generates aggregation hexagons within the AOI using the H3 library and calculates
    the mean LST value in °C for each hexagon based on the COG summer composites. The hexagons geometry 
    and their corresponding mean LST values are exported as a GeoJSON file.

    Parameters
    ----------
    folder_name : str
        The name of the folder containing the COG composites.
    aoi_geojson : str
        The file path of the AOI in GeoJSON format.
    hexagons_size : int
        The size (resolution) of the hexagons. Interval: [0,15]
        For more information, refer to: https://towardsdatascience.com/uber-h3-for-data-analysis-with-python-1e54acdcc908

    Returns
    -------
    None

    Examples
    --------
    >>> create_hexagons_with_statistics('Folder1_COG', 'aoi.geojson', 7)

    References
    ----------
    H3 Documentation: https://h3geo.org/
    """
    #Open and display the area of interest file
    aoi = gpd.read_file(aoi_geojson)

    # Generate hexagons within the AOI using H3 library
    hexagons = h3.polyfill(aoi.geometry[0].__geo_interface__, hexagons_size, geo_json_conformant=True)

    # Define a lambda function to convert H3 hexagon IDs to Shapely Polygon objects
    polygonise = lambda hex_id: Polygon(h3.h3_to_geo_boundary(hex_id, geo_json=True))

    # Create a GeoSeries of polygons from the hexagons, with hexagon IDs as index
    hexagons_geoseries = gpd.GeoSeries(list(map(polygonise, hexagons)), index=hexagons, crs="EPSG:4326")

    # Create an empty DataFrame to store the statistics
    statistics_df = pd.DataFrame(index=hexagons_geoseries.index)

    for cog_file in os.listdir(folder_name):
        if cog_file.endswith("_cog.tif"):

            # Get the year from the cog file name
            year= cog_file[-17:-15]
        
            # Calculate zonal statistics for the raster within each polygon in hexagons_geoseries
            statistics = zonal_stats(hexagons_geoseries, os.path.join(folder_name, cog_file), stats="mean")
            
            # Extract the mean values from the statistics and add them as a new column in the DataFrame
            statistics_df[f's_mean_{year}'] = [stat['mean'] if stat is not None else None for stat in statistics]

    # Concatenate hexagons_geoseries and statistics_df along the columns axis
    hexagons_statistics = pd.concat([hexagons_geoseries, statistics_df], axis=1)

    # Reset the index of hexagons_statistics, dropping the existing index
    hexagons_statistics = hexagons_statistics.reset_index(drop=True)

    for c in hexagons_statistics.columns[1:]:
        hexagons_statistics[c]=round(hexagons_statistics[c],3)

    # Extract the first column as the geometry
    geometry = hexagons_statistics[0]

    # Create a GeoDataFrame from hexagons_statistics with the specified CRS and using the extracted geometry column
    hexagons_statistics_gdf = gpd.GeoDataFrame(hexagons_statistics, crs="EPSG:4326", geometry=geometry)

    # Drop the '0' column which contains the geometry as string.
    hexagons_statistics_gdf = hexagons_statistics_gdf.drop(0, axis=1)  

    # Export as GeoJSON
    hexagons_statistics_gdf.to_file('Hexagons_Summer.geojson', driver='GeoJSON')

    print('Hexagons geojson with statistics successfully created')