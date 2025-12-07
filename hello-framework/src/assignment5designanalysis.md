---
title: Assignment 5 Design Analysis
---

## A rationale for your design decisions. How did you choose your particular visual encodings and interaction techniques? What alternatives did you consider and how did you arrive at your ultimate choices?

Second revision: I decided a positional idea would be better, so I used a slightly different dataset to map out drug related incidents, specifically in the state of Connecticut. I chose to encode the individual incidents with dots on a map, with the interactive technique being to hover over the points to get additional information about the incident. Initially, I wanted to do a map outline for the state, but this gave little information, so I used an shp file with road lines for the state of Connecticut. 

## References to external resources. Be sure to list the data sources you used. If your work adapts or builds on existing visualization examples, please cite those as well.

link to my dataset: https://catalog.data.gov/dataset/accidental-drug-related-deaths-2012-2018
shp file for road: https://catalog.data.gov/dataset/tiger-line-shapefile-2019-state-connecticut-primary-and-secondary-roads-state-based-shapefile

This is a second revision, and maps are commonly used for this kind of visualization.

## An overview of your development process. Describe how the work was split among the team members. Include a commentary on the development process, including answers to the following questions: Roughly how much time did you spend developing your application (in people-hours)? What aspects took the most time?

I worked solo on this project. The development process was tedious at first, and at some point I accidentally used the wrong state road data file. Later in the project, I had some weird issues so I went to chat gpt to help me debug (not super helpful, kept messing up other things too). This is when I decided to switch from the outline (geojson) to the road shp file. This took a lot of hours, and if you include the first submission, even longer. 