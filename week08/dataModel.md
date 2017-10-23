#Data Model 

I’ll be collecting data from a force sensor and an IR sensor, storing each in a separate table. 

I will place a coaster on top of the force sensor and use the data from the sensor to see how much water is in a water bottle, which I will place on the coaster. Since I want to see how this changes throughout the day, I will store in the force sensor table (fsrData) each force reading along with a timestamp. 

I’ll use the IR sensor to track how many times I walk past the water bottle. So, in the IR sensor table (irData), I will store each IR reading along with a timestamp, and additionally a boolean variable called “changed” that checks if the state of the IR sensor is different than the previous reading. I imagine that I’ll later filter the data by these points of change, but right now I’d like to store a more continuous stream of data just in case. 

