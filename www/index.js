export default {
  fetch(request) {
    const destination = new URL(request.url);
    destination.protocol = 'https:';
    destination.hostname = 'toetscijfers.nl';
    destination.port = '';
    return Response.redirect(destination, 308);
  },
};
