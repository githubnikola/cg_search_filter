/api/entities?filter[entity_type]=pages
/api/pages?filter[fields.name][e]=home&filter[field.title][e]=/home

e	=		equal to
ne	<>		not equal to
in	('')	in
nin			not in
lt	<		less then
lte <=		less then or equal to
gt	>		greater then
gte >=		greater then or equal to
m	?		?

using qs and parsing
var q = {
	"filter": {
		"fields.firstname": {
			"E": "Nikola"
		},
		"fields.lastname": {
			"E": "Jovanovic"
		}
	}
}

result
filter[fields.firstname][E]=Nikola&filter[fields.lastname][E]=Jovanovic
