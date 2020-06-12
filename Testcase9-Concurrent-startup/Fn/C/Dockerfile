FROM alpine:latest

# Install hotwrap binary in your container
COPY --from=fnproject/hotwrap:latest  /hotwrap /hotwrap

COPY ./helloworld /bin

CMD "/bin/helloworld"

ENTRYPOINT ["/hotwrap"]

