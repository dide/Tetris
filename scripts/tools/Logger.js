define(function() {
	return {
		getInstance : function() {
			return {
				info : function(message) {
					if (Logger.value <= 4)
						console.log("INFO : " + message);
				}
			};
		}
	};
});

function Logger() {

};

Logger.value = 4;

Logger.OFF = 0;
Logger.FATAL = 1;
Logger.ERROR = 2;
Logger.WARN = 3;
Logger.INFO = 4;
Logger.DEBUG = 5;
Logger.TRACE = 6;
Logger.ALL = 7;