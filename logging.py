import logging

# Configure logging:
# - level: Minimum severity level to log (DEBUG, INFO, WARNING, ERROR, CRITICAL).
# - format: Format of the log message.
# - filename (optional): File to write logs to. If not specified, logs are printed to the console.
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Log messages:
logging.debug('This is a debug message')
logging.info('This is an info message')
logging.warning('This is a warning message')
logging.error('This is an error message')
logging.critical('This is a critical message')
