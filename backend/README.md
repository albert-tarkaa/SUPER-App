# LEEDS BECKETT UNIVERSITY
**SCHOOL OF BUILT ENVIRONMENT, ENGINEERING AND COMPUTING**


## Small Urban Park Environments &amp; Residents (SUPER) Mobile Application Prototype for the Leeds Sustainability Institute (LSI)

Submitted to Leeds Beckett University in partial fulfilment of the requirements for the degree of MSc Information and Technology

By ***Albert Tarkaa Ago, Student ID: 77368783***

Supervised by ***[Dr. Gopal Jamnal](https://www.leedsbeckett.ac.uk/staff/dr-gopal-jamnal)***

September, 2024


## Project Overview

This project involves:
- Researching similar initiatives.
- Designing and developing a prototype app.
- Utilizing OpenStreetMap data or Mapbox for park information.

## Features

### Must-Have Features - These are the fundamental features the app must have to meet user expectations

- Users can locate parks and green spaces within Leeds city. &#9989;
- Directions on how to access the parks and green spaces on foot, by cycle and by bus. &#9989;
- Details about parks and green spaces facilities and accessibility, family and children friendliness including toilets, benches, bins, water fountains and sand areas.&#9203;
- Information on the events happening, and when parks and green spaces are open. &#9989;
- Access to microclimate and air quality data - Display of average and current air quality data, UV levels, and pollen count in the parks and green spaces. &#9989;

### Performance Features - These features will directly impact user satisfaction

- Information about amenities near parks and green spaces and in the vicinity (cash machines, cafes, shops, car 
  parks, secure bicycle parking). &#9989;
- Information on walking trails and what users can see along the way.
- Information about plant and tree species as well as parks and green spaces initiatives e.g. no-mow May.
- Art in the parks and green spaces - Historical and cultural references.
- Display of all green and blue spaces users can walk to within 10 minutes.
- Filters are available to show or hide a map of the parks and green spaces along with their various facilities. &#9203;

### Delight Features - These features will significantly enhance their overall experience

- Informative and engaging messages about the benefits of parks and green spaces air quality, e.g., air quality comparisons between city square and Park square.

## Technologies Used
- **Backend**: Spring Boot, Java v17, PostgreSQL v16
- **Tools**: Git, IntelliJ IDEA, Postman, pgAdmin, Maven, Docker
- **Documentation**: Postman. Documentation can be found [here](https://documenter.getpostman.com/view/32686033/2sA3s7kpho)

## Third-party APIs Used
- [WeatherMap](https://https://www.weatherapi.com)
    - Used to fetch current and 5-day forecast weather data for Leeds, UK.
    - Endpoint: ``` 
                    /api/v1/proxy/weather
                 ```
- [AirVisual](https://www.iqair.com)
  - Used to get the air quality data.
    Purpose: Retrieves air quality data based on latitude and longitude.
    
  - Endpoint: ``` 
                  /api/v1/proxy/air-quality
               ``` 
- [OpenRoute](https://openrouteservice.org)
    - Provides directions data based on start and end locations and travel profile.
    - Also used for fetching Points of Interest (POIs) around a specific location.
    - Endpoint: ``` 
                    /api/v1/proxy/directions
                 ```
    - Endpoint: ``` 
                    /api/v1/proxy/points-of-interest
                 ```
- [VoiceRSS](http://www.voicerss.org)
    - Converts text instructions to speech.
    - Endpoint: ``` 
                    /api/v1/proxy/speak
                 ```
- [PredictHQ](https://www.predicthq.com)
    - Fetches events data for the next 7 days within a 1.5-mile radius of Leeds, UK.
    - Endpoint: ``` 
                    /api/v1/proxy/events
                 ```



## How to setup using Docker
1. Clone the repository
2. Run `docker-compose up` in the root directory of the project or `docker compose up` if you use a Mac.
3. Access the application on `http://localhost:8080/api/v1/parks/list-parks` in your browser.

## How to create a docker image and push to Docker Hub
1. Run `docker build -t <image-name>:tag .` in the root directory of the project to build the image. Example: `docker 
   build -t super-app:latest .`
2. Run `docker login` to login to Docker Hub.
3. Run `docker tag <image-id> <docker-hub-username>/<image-name>:tag` to tag the image. Example: `docker tag 1234567890 
   alberttarkaa/super-app:latest`
4. Run `docker push <docker-hub-username>/<image-name>:tag` to push the image to Docker Hub. Example: `docker push 
   alberttarkaa/super-app:latest`

