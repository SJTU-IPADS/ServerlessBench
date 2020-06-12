#include <stdio.h>
#include <sys/time.h>
int main(int argc, char *argv[]) {
    struct timeval tv;
    gettimeofday(&tv,NULL);
    printf("{ \"msg\": \"Hello from arbitrary C program!\", \"startTime\": %ld }", tv.tv_sec*1000 + tv.tv_usec/1000);
}
