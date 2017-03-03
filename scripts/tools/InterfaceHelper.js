define([], function() {
	return {
		ensureImplements : function(objet, interfs) {
			// If interfs is not an array, assume it's a function pointer
			var toImplement = interfs.constructor == Array ? interfs
					: [ interfs ];
			var interf;

			// For every interf that objet must implement:
			for (var i = 0, len = toImplement.length; i < len; i++) {
				interf = toImplement[i];

				// Make sure it indeed is an interf
				if (interf.constructor != Interface)
					throw new Error(
							"Object trying to implement a non-interf. "
									+ interf.name + " is not an Interface.");

				// Make sure objet has all of the methods described in the
				// interf
				for (var j = 0, interfLen = interf.methods.length; j < interfLen; j++)
					if (!objet[interf.methods[j]])
						throw new Error("Interface method not implemented. "
								+ interf.name + " defines method "
								+ interf.methods[j]);
			}

			return true;
		}
	};
});
