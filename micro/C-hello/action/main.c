
#include <stdio.h>
#include <sys/time.h>
int main(int argc, char *argv[]) {
    struct timeval tv;
    gettimeofday(&tv,NULL);
    printf("This is a log\n");
    printf("{ \"msg\": \"Hello from arbitrary C program!\", \"args\": %s ,\"startTime\": %ld }",
           (argc == 1) ? "undefined" : argv[1], tv.tv_sec*1000 + tv.tv_usec/1000);
}
