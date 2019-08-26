import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";
const primaryColors = ['red', 'blue', 'yellow'];

/**
 * Function to retreive records and transform data
 * @param {*} options  obj with properties page and colors[] to query trhe records endpoint for
 */
const retrieve = (options = {}) => new Promise( async (resolve, reject) => {
	const { page = 1 } = options;

	// I'm  not sure how we are supposed to determine when we are out of records to set the 'nextPage' property to null
	// so I'm going to retreive 11 results each time and throw one away to see if there are more. hacky, I know.
	options.limit = 11;
	options.offset = ((page-1) * 10);
	if(options.colors) {
		options['color[]'] = options.colors;
		delete options.colors;
	}

	const uri = new URI(window.path).addSearch(options);

	let response;
	try {
		response = await fetch(uri);
		if(!response || !response.status || response.status != 200) throw new Error(response);
		var contentType = response.headers.get('content-type');
		if(!contentType && !contentType.includes('application/json')) throw new Error(response);
	} catch(err) {
		console.log('error');
		return resolve(); //don't reject here so function can recover per instructions
	}

	let records = await response.json();
	const numberOfRecords = records.length;
	if(numberOfRecords === 11) records.pop();

	const output = {
		ids: records.map(r => r.id),
		open: records.filter(r => r.disposition === 'open').map(r => ({...r, isPrimary: (primaryColors.includes(r.color))})),
		closedPrimaryCount: records.filter(r => r.disposition === 'closed' && primaryColors.includes(r.color)).length,
		previousPage: (page === 1) ? null : page - 1,
		nextPage: (numberOfRecords <= 10) ? null : page + 1,
	}
	resolve(output);
});

export default retrieve;
