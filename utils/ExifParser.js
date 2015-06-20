
 var Basic = require("./Utils");
 var BinaryReader = require("./BinaryReader").BinaryReader;


function ExifParser(data) {
	var parent;
	var tags, tagDescs, Tiff, offsets;

	BinaryReader.apply(this, arguments);

	parent = this; // save the ref to parent methods

	tags = {
		tiff: {
			/*
			The image orientation viewed in terms of rows and columns.

			1 = The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
			2 = The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
			3 = The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
			4 = The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
			5 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
			6 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
			7 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
			8 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
			*/
			0x0112: 'Orientation',
			0x010E: 'ImageDescription',
			0x010F: 'Make',
			0x0110: 'Model',
			0x0131: 'Software',
			0x8769: 'ExifIFDPointer',
			0x8825:	'GPSInfoIFDPointer'
		},
		exif: {
			0x9000: 'ExifVersion',
			0xA001: 'ColorSpace',
			0xA002: 'PixelXDimension',
			0xA003: 'PixelYDimension',
			0x9003: 'DateTimeOriginal',
			0x829A: 'ExposureTime',
			0x829D: 'FNumber',
			0x8827: 'ISOSpeedRatings',
			0x9201: 'ShutterSpeedValue',
			0x9202: 'ApertureValue'	,
			0x9207: 'MeteringMode',
			0x9208: 'LightSource',
			0x9209: 'Flash',
			0x920A: 'FocalLength',
			0xA402: 'ExposureMode',
			0xA403: 'WhiteBalance',
			0xA406: 'SceneCaptureType',
			0xA404: 'DigitalZoomRatio',
			0xA408: 'Contrast',
			0xA409: 'Saturation',
			0xA40A: 'Sharpness'
		},
		gps: {
			0x0000: 'GPSVersionID',
			0x0001: 'GPSLatitudeRef',
			0x0002: 'GPSLatitude',
			0x0003: 'GPSLongitudeRef',
			0x0004: 'GPSLongitude'
		},

		thumb: {
			0x0201: 'JPEGInterchangeFormat',
			0x0202: 'JPEGInterchangeFormatLength'
		}
	};

	tagDescs = {
		'ColorSpace': {
			1: 'sRGB',
			0: 'Uncalibrated'
		},

		'MeteringMode': {
			0: 'Unknown',
			1: 'Average',
			2: 'CenterWeightedAverage',
			3: 'Spot',
			4: 'MultiSpot',
			5: 'Pattern',
			6: 'Partial',
			255: 'Other'
		},

		'LightSource': {
			1: 'Daylight',
			2: 'Fliorescent',
			3: 'Tungsten',
			4: 'Flash',
			9: 'Fine weather',
			10: 'Cloudy weather',
			11: 'Shade',
			12: 'Daylight fluorescent (D 5700 - 7100K)',
			13: 'Day white fluorescent (N 4600 -5400K)',
			14: 'Cool white fluorescent (W 3900 - 4500K)',
			15: 'White fluorescent (WW 3200 - 3700K)',
			17: 'Standard light A',
			18: 'Standard light B',
			19: 'Standard light C',
			20: 'D55',
			21: 'D65',
			22: 'D75',
			23: 'D50',
			24: 'ISO studio tungsten',
			255: 'Other'
		},

		'Flash': {
			0x0000: 'Flash did not fire.',
			0x0001: 'Flash fired.',
			0x0005: 'Strobe return light not detected.',
			0x0007: 'Strobe return light detected.',
			0x0009: 'Flash fired, compulsory flash mode',
			0x000D: 'Flash fired, compulsory flash mode, return light not detected',
			0x000F: 'Flash fired, compulsory flash mode, return light detected',
			0x0010: 'Flash did not fire, compulsory flash mode',
			0x0018: 'Flash did not fire, auto mode',
			0x0019: 'Flash fired, auto mode',
			0x001D: 'Flash fired, auto mode, return light not detected',
			0x001F: 'Flash fired, auto mode, return light detected',
			0x0020: 'No flash function',
			0x0041: 'Flash fired, red-eye reduction mode',
			0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
			0x0047: 'Flash fired, red-eye reduction mode, return light detected',
			0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
			0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
			0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
			0x0059: 'Flash fired, auto mode, red-eye reduction mode',
			0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
			0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
		},

		'ExposureMode': {
			0: 'Auto exposure',
			1: 'Manual exposure',
			2: 'Auto bracket'
		},

		'WhiteBalance': {
			0: 'Auto white balance',
			1: 'Manual white balance'
		},

		'SceneCaptureType': {
			0: 'Standard',
			1: 'Landscape',
			2: 'Portrait',
			3: 'Night scene'
		},

		'Contrast': {
			0: 'Normal',
			1: 'Soft',
			2: 'Hard'
		},

		'Saturation': {
			0: 'Normal',
			1: 'Low saturation',
			2: 'High saturation'
		},

		'Sharpness': {
			0: 'Normal',
			1: 'Soft',
			2: 'Hard'
		},

		// GPS related
		'GPSLatitudeRef': {
			N: 'North latitude',
			S: 'South latitude'
		},

		'GPSLongitudeRef': {
			E: 'East longitude',
			W: 'West longitude'
		}
	};
	
	// Public functions
	Basic.extend(this, {
		
		read: function() {
			try {
				return parent.read.apply(this, arguments);
			} catch (ex) {
				throw new x.ImageError(x.ImageError.INVALID_META_ERR);
			}
		},


		write: function() {
			try {
				return parent.write.apply(this, arguments);
			} catch (ex) {
				throw new x.ImageError(x.ImageError.INVALID_META_ERR);
			}
		},


		UNDEFINED: function() {
			return this.BYTE.apply(this, arguments);
		},


		RATIONAL: function(idx) {
			return this.LONG(idx) / this.LONG(idx + 4)
		},


		SRATIONAL: function(idx) {
			return this.SLONG(idx) / this.SLONG(idx + 4)
		},


		TEXT: function(idx, count) {
			return this.asArray('STRING', idx, count).join('');
		},


		asArray: function(type, idx, count) {
			var values = [];

			for (var i = 0; i < count; i++) {
				values[i] = this[type](idx);
			}

			return values;
		},


		TIFF: function() {
			return Tiff || null;
		},


		EXIF: function() {
			var Exif = null;

			if (offsets.exifIFD) {
				try {
					Exif = extractTags.call(this, offsets.exifIFD, tags.exif);
				} catch(ex) {
					return null;
				}

				// Fix formatting of some tags
				if (Exif.ExifVersion && Basic.typeOf(Exif.ExifVersion) === 'array') {
					for (var i = 0, exifVersion = ''; i < Exif.ExifVersion.length; i++) {
						exifVersion += String.fromCharCode(Exif.ExifVersion[i]);
					}
					Exif.ExifVersion = exifVersion;
				}
			}

			return Exif;
		},


		GPS: function() {
			var GPS = null;

			if (offsets.gpsIFD) {
				try {
					GPS = extractTags.call(this, offsets.gpsIFD, tags.gps);
				} catch (ex) {
					return null;
				}

				// iOS devices (and probably some others) do not put in GPSVersionID tag (why?..)
				if (GPS.GPSVersionID && Basic.typeOf(GPS.GPSVersionID) === 'array') {
					GPS.GPSVersionID = GPS.GPSVersionID.join('.');
				}
			}

			return GPS;
		},


		thumb: function() {
			if (offsets.IFD1) {
				try {
					var IFD1Tags = extractTags.call(this, offsets.IFD1, tags.thumb);
					
					if ('JPEGInterchangeFormat' in IFD1Tags) {
						return data.SEGMENT(offsets.tiffHeader + IFD1Tags.JPEGInterchangeFormat, IFD1Tags.JPEGInterchangeFormatLength);
					}
				} catch (ex) {}
			}
			return null;
		},


		setExif: function(tag, value) {
			// Right now only setting of width/height is possible
			if (tag !== 'PixelXDimension' && tag !== 'PixelYDimension') { return false; }

			return setTag.call(this, 'exif', tag, value);
		},


		clear: function() {
			parent.clear();
			data = tags = tagDescs = Tiff = offsets = parent = null;
		}
	});


	// Check if that's APP1 and that it has EXIF
	if (this.SHORT(0) !== 0xFFE1 || this.TEXT(4, 5).toUpperCase() !== "EXIF\0") {
		throw new x.ImageError(x.ImageError.INVALID_META_ERR);
	}


	offsets = getIFDOffsets.call(this); // also populates Tiff with appropriate values


	function extractTags(IFD_offset, tags2extract) {
		var data = this;
		var length, i, tag, type, count, tagOffset, offset, value, values = [], hash = {};
		
		var types = {
			1 : 'BYTE',
			7 : 'UNDEFINED',
			2 : 'STRING',
			3 : 'SHORT',
			4 : 'LONG',
			5 : 'RATIONAL',
			9 : 'SLONG',
			10: 'SRATIONAL'
		}; 

		length = data.SHORT(IFD_offset);

		// The size of APP1 including all these elements shall not exceed the 64 Kbytes specified in the JPEG standard.

		for (i = 0; i < length; i+=12) {
			values = [];

			// Set binary reader pointer to beginning of the next tag
			offset = tagOffset = IFD_offset + 2 + i;

			tag = tags2extract[data.SHORT(offset)];

			if (tag === undefined) {
				continue; // Not the tag we requested
			}

			type = types[data.SHORT(offset+=2)];
			count = data.LONG(offset+=2);

			offset += 4;

			switch (type) {
				case 'BYTE':
				case 'UNDEFINED':
				case 'STRING':
					if (count > 4) {
						offset = data.LONG(offset) + offsets.tiffHeader;
					}
					break;

				case 'LONG':
				case 'SLONG':
					if (count > 1) {
						offset = data.LONG(offset) + offsets.tiffHeader;
					}
					break;

				case 'RATIONAL':
				case 'SRATIONAL':
					offset = data.LONG(offset) + offsets.tiffHeader;
					break;

				default:
					throw new x.ImageError(x.ImageError.INVALID_META_ERR);
			}

			values = data.asArray(type, offset, count);

			if (type === 'STRING') {
				hash[tag] = values.join('');
			} 

			value = (count == 1 ? values[0] : values);

			if (tagDescs.hasOwnProperty(tag) && typeof value != 'object') {
				hash[tag] = tagDescs[tag][value];
			} else {
				hash[tag] = value;
			}
		}

		return hash;
	}

	
	function getIFDOffsets() {
		var offsets, IFD1Offset, idx;

		offsets = {
			tiffHeader: 10
		};
		
		idx = offsets.tiffHeader;

		// Set read order of multi-byte data
		this.littleEndian = (this.SHORT(idx) == 0x4949);

		// Check if always present bytes are indeed present
		if (this.SHORT(idx+=2) !== 0x002A) {
			throw new x.ImageError(x.ImageError.INVALID_META_ERR);
		}

		offsets.IFD0 = offsets.tiffHeader + this.LONG(idx += 2);
		Tiff = extractTags.call(this, offsets.IFD0, tags.tiff);

		if ('ExifIFDPointer' in Tiff) {
			offsets.exifIFD = offsets.tiffHeader + Tiff.ExifIFDPointer;
			delete Tiff.ExifIFDPointer;
		}

		if ('GPSInfoIFDPointer' in Tiff) {
			offsets.gpsIFD = offsets.tiffHeader + Tiff.GPSInfoIFDPointer;
			delete Tiff.GPSInfoIFDPointer;
		}

		// check if we got thumb data as well
		IFD1Offset = this.LONG(offsets.IFD0 + this.SHORT(offsets.IFD0) * 12 + 2);
		if (IFD1Offset) {
			offsets.IFD1 = offsets.tiffHeader + IFD1Offset;
		}
		return offsets;
	}

	// At the moment only setting of simple (LONG) values, that do not require offset recalculation, is supported
	function setTag(ifd, tag, value) {
		var offset, length, tagOffset, valueOffset = 0;

		// If tag name passed translate into hex key
		if (typeof(tag) === 'string') {
			var tmpTags = tags[ifd.toLowerCase()];
			for (var hex in tmpTags) {
				if (tmpTags[hex] === tag) {
					tag = hex;
					break;
				}
			}
		}
		offset = offsets[ifd.toLowerCase() + 'IFD'];
		length = data.SHORT(offset);

		for (var i = 0; i < length; i++) {
			tagOffset = offset + 12 * i + 2;

			if (data.SHORT(tagOffset) == tag) {
				valueOffset = tagOffset + 8;
				break;
			}
		}

		if (!valueOffset) {
			return false;
		}

		try {
			data.write(valueOffset, value, 4);
		} catch(ex) {
			return false;
		}

		return true;
	}
}


exports.ExifParser = ExifParser;
