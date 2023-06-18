"""
Interact with the NASA AppEEARS API to obtain and process ECOSTRESS satellite data.

Functions
----------
get_token(username): 
    Get authentication token from NASA Earthdata Login API.

submit_task(token, request_name, start_date, end_date, aoi): 
    Submit a task to the NASA AppEEARS API.

list_tasks(token): 
    List all the tasks associated with a user account.

download_data_bundles(token, list_task_id): 
    Download data bundles for the given task IDs.

apply_cloud_masking(list_folder_name): 
    Apply cloud masking to the specified folders of raw images.
"""

import requests
from getpass import getpass
from os.path import join, basename, splitext
import json
import os
from datetime import datetime
import pandas as pd
from glob import glob
import rioxarray
import numpy as np
import warnings
warnings.filterwarnings("ignore")

def get_token(username):
    """Get authentication token from NASA Earthdata Login API.

    This function sends a POST request to the NASA Earthdata Login API to
    obtain an authentication token for the specified username. This token
    will expire approximately 48 hours after being acquired.

    Parameters
    ----------
    username : str
        The username for authentication.

    Returns
    -------
    str
        The authentication token.

    Raises
    ------
    requests.exceptions.RequestException
        If an error occurs while making the request.

    Examples
    --------
    >>> get_token("my_username") 

    References
    ----------
    API Documentation: https://appeears.earthdatacloud.nasa.gov/api/?python#authentication
    """

    # Define the URL for the NASA Earthdata Login API
    url = "https://appeears.earthdatacloud.nasa.gov/api/login"
    
    # Prompt the user for their password securely
    password = getpass("Enter your password: ")
    
    try:
        # Send a POST request with the provided username and password
        response = requests.post(url, auth=(username, password))
        # Raise an exception if the request was not successful (status code >= 400)
        response.raise_for_status()
        # Extract the authentication token from the response JSON
        token = response.json()["token"]
        # Return the authentication token
        return token
    
    except requests.exceptions.RequestException as e:
        # Print the error message if there was an exception
        print("Error:", e)
        return None
    

def submit_task(token,request_name, start_date, end_date, aoi):
    """Submit a task to the NASA AppEEARS API.

    Submits a task to the NASA AppEEARS API to request ECOSTRESS satellite
    data for a specific area of interest (AOI) and time range. 
    Two products-layers are requested:
    - Product: ECO2LSTE.001 (ECOSTRESS Land Surface Temperature and 
      Emissivity Daily L2 Global 70 m)
      Layer: SDS_LST (Land Surface Temperature)
    - Product: ECO2CLD.001 - SDS_CloudMask (ECOSTRESS Cloud Mask Daily 
      L2 Global 70 m)
      Layer: Cloud Mask (Cloud Mask)
    The task request includes the authentication token, request name, 
    start and end dates, and AOI coordinates.

    Parameters
    ----------
    token : str
        The authentication token obtained from the `get_token` function.
    request_name : str
        The name of the task request.
    start_date : str
        The start date of the time range in 'YYYY-MM-DD' format.
    end_date : str
        The end date of the time range in 'YYYY-MM-DD' format.
    aoi : str
        A GeoJSON path defining the spatial region of interest.
        The projection of any coordinates must be in a geographic projection.

    Returns
    -------
    dict
        The dict response from the task submission containing information
        about the task, including the task ID and status.

    Raises
    ------
    requests.exceptions.RequestException
        If there is an error during the API request.

    References
    ----------
    API Documentation: https://appeears.earthdatacloud.nasa.gov/api/?python#submit-task
    ECOSTRESS Products: https://appeears.earthdatacloud.nasa.gov/products

    Examples
    --------
    >>> submit_task(token, "MyTask", "2023-06-01", "2023-06-10", "aoi.geojson")
    """
    
    # Extract Coordinates from AOI geojson
    map_json = json.load(open(aoi))
    coords = map_json["features"][0]["geometry"]["coordinates"][0]

    # Create the task request JSON based on the input parameters
    task = {
        "params": {
            "geo": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            coords
                        ]
                    },
                    "properties": {}
                }]
            },
            "dates": [{
                "endDate": end_date,
                "startDate": start_date
            }],
            "layers": [{
                "layer": "SDS_LST",
                "product": "ECO2LSTE.001"
            }, {
                "layer": "SDS_CloudMask",
                "product": "ECO2CLD.001"
            }],
            "output": {
                "format": {
                    "type": "geotiff"
                },
                "projection": "native"
            }
        },
        "task_name": request_name,
        "task_type": "area"
    }

    try:
        # Make the request to submit the task
        response = requests.post(
            'https://appeears.earthdatacloud.nasa.gov/api/task',
            json=task,
            headers={'Authorization': 'Bearer {0}'.format(token)}
        )
        response_json = response.json()
        return response_json
    
    except requests.exceptions.RequestException as e:
        # Print the error message if there was an exception
        print("Error:", e)
        return None
    

def list_tasks(token):
    """List all the tasks associated with a user account.

    This function sends a GET request to the NASA AppEEARS API to retrieve
    information about all the tasks associated with the user account.
    It extracts the task names, IDs, and statuses from the JSON response.

    Parameters
    ----------
    token : str
        The authentication token obtained from the `get_token` function.

    Returns
    -------
    list
        A list of dictionaries, each containing the task name, ID, and status.

    Raises
    ------
    requests.exceptions.RequestException
        If there is an error during the API request.

    Examples
    --------
    >>> list_tasks(token)

    References
    ----------
    API Documentation: https://appeears.earthdatacloud.nasa.gov/api/?python#list-tasks
    """

    try:
        # Send a GET request to retrieve the tasks associated with the user account
        response = requests.get(
            'https://appeears.earthdatacloud.nasa.gov/api/task',
            headers={'Authorization': 'Bearer {0}'.format(token)}
        )
        # Parse the JSON response
        response_json = response.json()
        # Extract the Task names, IDs, and statuses from the JSON object
        tasks_list = [
            {"name": task["task_name"], "id": task["task_id"], "status": task["status"]}
            for task in response_json
        ]
        return tasks_list
    
    except requests.exceptions.RequestException as e:
        # Print the error message if there was an exception
        print("Error:", e)
        return []
    

def download_data_bundles(token, list_task_id):
    """Download data bundles for the given task IDs.

    This function  downloads the data bundles linked to the given task IDs
    from the NASA AppEEARS API.  Each task ID represents a particular task that 
    comprises various files, primarily the raw Land Surface Temperature (LST) 
    ECOSTRESS images and their corresponding cloud mask files. The function 
    generates a destination folder for each task based on its name and stores the 
    downloaded files within the respective folder.

    Parameters
    ----------
    token : str
        The authentication token obtained from the `get_token` function.
    list_task_id : list of str
         A list of task IDs (as strings) for which data bundles should be 
         downloaded.
    
    Returns
    -------
    None
        
    Examples
    --------
    >>> task_ids = ['123', '456', '789']
    >>> download_data_bundles(token, task_ids)

    References
    ----------
    API Documentation: https://appeears.earthdatacloud.nasa.gov/api/?python#download-file
    """

    for task_id in list_task_id:
        # Get the task name
        task = requests.get(
            'https://appeears.earthdatacloud.nasa.gov/api/task/{0}'.format(task_id),
            headers={'Authorization': 'Bearer {0}'.format(token)}
        )
        task_json = task.json()
        task_name = task_json['task_name']

        # Create a destination folder based on task name
        dest_dir = task_name + "_Raw"
        os.makedirs(dest_dir, exist_ok=True)

        # Get the data bundle of the requested task ID
        bundle = requests.get(
            'https://appeears.earthdatacloud.nasa.gov/api/bundle/{0}'.format(task_id),
            headers={'Authorization': 'Bearer {0}'.format(token)}
        )
        bundle_json = bundle.json()

        # Download all the files in the bundle
        for i in range(len(bundle_json['files'])):
            file = requests.get(
                'https://appeears.earthdatacloud.nasa.gov/api/bundle/{0}/{1}'.format(
                    task_id, bundle_json['files'][i]['file_id']
                ),
                headers={'Authorization': 'Bearer {0}'.format(token)},
                allow_redirects=True,
                stream=True
            )

            with open(
                os.path.join(dest_dir, os.path.split(bundle_json['files'][i]['file_name'])[-1]), 'wb'
            ) as f:
                for data in file.iter_content(chunk_size=8192):
                    f.write(data)

        print(
            'Download for Task ID {0} corresponding to Task Name {1} has been completed.'.format(
                task_id, task_name
            )
        )


def apply_cloud_masking(list_folder_name):
    """Apply cloud masking to the specified folders of images.

    This function applies cloud masking to the raw Land Surface Temperature (LST)
    ECOSTRESS images using the corresponding cloud mask files. It requires an input folder 
    that contains both the raw images and the associated cloud mask files. The function
    creates an output directory to store the processed images as masked TIFF files.

    Parameters
    ----------
    list_folder_name : list of str
        A list of folder names containing the raw data files and associated
        cloud mask files. Each folder corresponds to a specific set of images
        to be processed.

    Returns
    -------
    None

    Examples
    --------
    >>> folders = ['Folder1_Raw', 'Folder2_Raw']
    >>> apply_cloud_masking(folders)

    References
    ----------
    NASA Youtube Tutorial: https://www.youtube.com/watch?v=Yc8QDt2f4hs&t=1462s
    """

    for folder_name in list_folder_name:
        # Create output directory processed images
        output_directory =  folder_name.replace("_Raw", "_Masked")
        os.makedirs(output_directory, exist_ok=True)

        # Create Data Frame: date, raw data file path, cloud mask file path and  masked tiff file path
        LST_filenames=[]
        LST_raw_filenames = pd.DataFrame({"LST_raw_filename": sorted(glob(join(folder_name, "*_LST_*.tif")))})
        LST_raw_filenames["datetime_UTC"] = LST_raw_filenames.LST_raw_filename.apply(lambda LST_raw_filename: datetime.strptime(splitext(basename(LST_raw_filename))[0].split("_")[-2][3:], "%Y%j%H%M%S"))

        cloud_filenames = pd.DataFrame({"cloud_filename": sorted(glob(join(folder_name, "*_CloudMask_*.tif")))})
        cloud_filenames["datetime_UTC"] = cloud_filenames.cloud_filename.apply(lambda cloud_filename: datetime.strptime(splitext(basename(cloud_filename))[0].split("_")[-2][3:], "%Y%j%H%M%S"))

        LST_filenames = pd.merge(LST_raw_filenames, cloud_filenames)
        LST_filenames["LST_masked_filename"] = LST_filenames.datetime_UTC.apply(lambda datetime_UTC: join(output_directory, f"{datetime_UTC:%Y.%m.%d.%H.%M.%S}_LST.tif"))
        LST_filenames = LST_filenames[["datetime_UTC", "LST_raw_filename", "cloud_filename", "LST_masked_filename"]]
        print(LST_filenames["LST_raw_filename"][0])

        # Cloud Mask Application
        for i, (datetime_UTC, LST_raw_filename, cloud_filename, LST_masked_filename) in LST_filenames.iterrows():
            # Open LST raw image file
            LST = rioxarray.open_rasterio(LST_raw_filename).squeeze("band", drop=True)
            # Convert values of raw image file to Temperature → Apply Scale factor to DN and then convert from K to °C
            LST.data = np.where(LST.data == 0, np.nan, LST.data * 0.02) - 273.15
            # Open associated cloud file and make sure it is on the same spatial grid as the LST raw image file
            cloud = rioxarray.open_rasterio(cloud_filename).squeeze("band", drop=True).rio.reproject_match(LST)
            # Bit masking to convert to a cloud mask
            cloud.data = (cloud.data >> 2) & 1
            # Apply cloud mask
            LST.data = np.where(cloud.data, np.nan, LST.data)

            # Remove possible outliers
            low, high = np.nanquantile(LST.data, [0.01, 0.99])
            LST.data = np.where((LST.data < low) | (LST.data > high), np.nan, LST.data)

            # Quantify missing pixels in the image
            #missing_proportion = np.count_nonzero(np.isnan(LST.data)) / LST.data.size
            #if missing_proportion > 0.5:
            #   continue

            # Write image as a new .tif
            LST.rio.to_raster(LST_masked_filename)
        
        print('Masking for folder {0} has been completed.'.format(folder_name))
