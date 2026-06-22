FROM nginx:1.27-alpine AS runner
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R a+rX /usr/share/nginx/html /etc/nginx/conf.d/default.conf
EXPOSE 18100
