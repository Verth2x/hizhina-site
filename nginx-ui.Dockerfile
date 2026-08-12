FROM uozi/nginx-ui:latest

# Nginx UI seeds /etc/nginx from /usr/local/etc/nginx when its persistent
# volume is empty. Keep the initial proxy sites in that seed so the gateway
# works before anyone signs in to the UI.
COPY nginx-ui/sites-available/hizhina /usr/local/etc/nginx/sites-available/hizhina
RUN ln -s ../sites-available/hizhina /usr/local/etc/nginx/sites-enabled/hizhina
