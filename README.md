# Congraph CMS - Query Builder

### Content type API endpoint
```
/api/entities?filter[entity_type]=page
```
Alias (same as above)
```
/api/pages
```

### URL Query

```
/api/pages?filter[fields.name][e]=home&filter[fields.title][e]=/home
```

| Operator  | Description   | Example     |
| --------- | ------------- | ----------- |
| `e`       | equal to | `?filter[fields.code][e]=dZ5b2` |
| `ne`      | not equal to | `?filter[fields.color][ne]=white` |
| `in`      | in | `?filter[fields.color][in]=black,goldw` |
| `nin`     | not in | `?filter[fields.color][nin]=pink,blue` |
| `lt`      | less then | `?filter[fields.area][lt]=120` |
| `lte`     | less then or equal to | `?filter[fields.age][lte]=17` |
| `gt`      | greater then | `?filter[fields.height][gt]=180` |
| `gte`     | greater then or equal to | `?filter[fields.age][gte]=18` |
| `m`       | match (full text search) | `?filter[fields.title][m]=string` |

Using [qs](https://github.com/ljharb/qs) library and parsing
```javascript
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

var str = qs.stringify(q);
// => filter[fields.firstname][E]=Nikola&filter[fields.lastname][E]=Jovanovic
```
