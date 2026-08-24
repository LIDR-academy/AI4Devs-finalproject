class ERPGatewayError(Exception):
   """Base class for errors raised by the ERP Gateway."""


class ERPUnavailableError(ERPGatewayError):
   """The ERP webservice could not be reached: timeout, connection error, or
   a 5xx response after exhausting retries."""


class ERPValidationError(ERPGatewayError):
   """The ERP webservice rejected the request (4xx) with a business message."""

   def __init__(self, message: str, status_code: int):
      super().__init__(message)
      self.status_code = status_code
