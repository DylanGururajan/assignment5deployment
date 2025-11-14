---
title: Assignment 5
---

## A rationale for your design decisions. How did you choose your particular visual encodings and interaction techniques? What alternatives did you consider and how did you arrive at your ultimate choices?

    I elected to create an interactive line graph representing the estimated death rate for each category of drug (deaths per 100,000). I felt this was the a solid design to separate the multiple variables and demonstrate chnge over time. I considered some kind of interactive bubble chart initially, but I figured a bubble chart would lack the ability to represent the data vectors that I wanted. Further, I wanted to neatly display the differences between these lines at different points, one of the strongest traits of a line graph. For my interactivity, I elected for the user to view more information on a line by hovering over it. This allows the chart to appear consice and clean, while also providing the user with sufficient information.

## References to external resources. Be sure to list the data sources you used. If your work adapts or builds on existing visualization examples, please cite those as well.

    link to my dataset: https://catalog.data.gov/dataset/drug-overdose-death-rates-by-drug-type-sex-age-race-and-hispanic-origin-united-states-3f72f
    From US department of health and human services, I downloaded the CSV file

    My design was not directly based off of another, but line charts are a common format used.

## An overview of your development process. Describe how the work was split among the team members. Include a commentary on the development process, including answers to the following questions: Roughly how much time did you spend developing your application (in people-hours)? What aspects took the most time?

    I worked alone so I handled everything. The development process was full of small errors... my biggest problem was loading the csv file. This proved to be a bigger challenge than I had anticipated. I ended up creating a js file to load to csv file for use. This project took around 3.5-4.5 hours, but went smoothly after the basic graph was created (before the lines were added but axis were). I had some issues deploying the static github webpage as well.