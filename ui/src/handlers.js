import {http, HttpResponse} from 'msw';
const sequelize = require('../../api/database');

export const handlers = [
    http.post(
        // The "/entires/create_entry" string is a path predicate.
        // Only the GET requests whose path matches
        // the "/entries/create_entry" string will be intercepted.
        '/entries/create_entry',
        // The function below is a "resolver" function.
        // It accepts a bunch of information about the
        // intercepted request, and decides how to handle it.
        (info) => {
            
            return HttpResponse.json(['Tom', 'Jerry', 'Spike'])
        },
      )
]