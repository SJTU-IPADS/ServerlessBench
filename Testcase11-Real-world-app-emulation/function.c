// This is a simplest function in a function chain
#include <stdio.h>
#include <sys/time.h>
int main(){
    struct timeval tv;
    gettimeofday(&tv, NULL);
    printf(
        "{\n" 
        "   startTime: %ld\n"
        "}\n", tv.tv_sec * 1000 + tv.tv_usec / 1000);
}