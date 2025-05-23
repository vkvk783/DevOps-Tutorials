#!/bin/bash

# Log a simple message
echo "This is a log message"

# Log a message with a variable
message="Important information"
echo "Log: $message"

# Log a message to a file
echo "This message will be logged to file" > logfile.txt

# Append a message to a file
echo "Appending this message" >> logfile.txt

# Log with timestamp
timestamp=$(date +"%Y-%m-%d %T")
echo "[$timestamp] Log with timestamp"

# Log error message to standard error
echo "Error occurred" >&2

# Redirect all output (including errors) to a log file
exec &> script.log
echo "This will go to script.log"
echo "So will this"
