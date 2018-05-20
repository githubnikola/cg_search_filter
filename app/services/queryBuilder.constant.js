/*
* Injected into quryBuilderService in ConditionBuilderDirective.js
*/

export default {
    conditions: {
            "e": {
                label: "Equal",
                symbol: "="
            },
            "ne": {
                label: "Not equal",
                symbol: "<>"
            },
            "in": {
                label: "In",
                symbol: ""
            },
            "nin": {
                label: "Not in",
                symbol: ""
            },
            "lt": {
                label: "Less than",
                symbol: "<"
            },
            "lte": {
                label: "Less than or equal to",
                symbol: "<="
            },
            "gt": {
                label: "Greater than",
                symbol: ">"
            },
            "gte": {
                label: "Greater then or equal to",
                symbol: ">="
            },
            "m": {
                label: "Match",
                symbol: "%"
            }
    },
    operatorByCondition: {
        "Equal": "e",
        "Not equal": "ne",
        "In": "in",
        "Not in": "nin",
        "Less than": "lt",
        "Less than or equal to": "lte",
        "Greater than": "gt",
        "Greater than or equal to": "gte",
        "Match": "m"
    },
    fieldTypeConditionMap: {
        "text": ['e', 'ne', 'in', 'nin', /*'lt', 'lte', 'gt', 'gte',*/ 'm'],
        "tags": ['e', 'ne', 'in', 'nin', /*'lt', 'lte', 'gt', 'gte',*/ 'm'],
        "integer": ['e', 'ne', /*'in', 'nin',*/ 'lt', 'lte', 'gt', 'gte', /*'m'*/],
        "decimal": ['e', 'ne', /*'in', 'nin',*/ 'lt', 'lte', 'gt', 'gte', /*'m'*/],
        "datetime": ['e', 'ne', /*'in', 'nin',*/ 'lt', 'lte', 'gt', 'gte', /*'m'*/],
        "boolean": ['e', 'ne', /*'in', 'nin', 'lt', 'lte', 'gt', 'gte', 'm'*/],
        "select": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', 'm'],
        "multiselect": ['e', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte', 'm']
    },
    fieldTypeInputMap: {
        "text": "text",
        "tags": "text",
        "integer": "number",
        "decimal": "number",
        "datetime": "date",
        "boolean": "text",
        "select": "text",
        "multiselect": "text"            
    }
}
