// Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
// ServerlessBench is licensed under the Mulan PSL v1.
// You can use this software according to the terms and conditions of the Mulan PSL v1.
// You may obtain a copy of Mulan PSL v1 at:
//     http://license.coscl.org.cn/MulanPSL
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v1 for more details.

// This is a simplest function in a function chain
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#include <string.h>

#define KILO_BYTE 1024
#define MEGA_BYTE ((KILO_BYTE) * (KILO_BYTE))
#define PLACEHOLDERZYGOTE "0123456789"
#define PLACEHOLDER_LEN 100

void AllocMem(int);
char* GeneratePlaceholder();

void AllocMem(int allocMemSize){
    int memSize = allocMemSize * MEGA_BYTE;
    char* memory = (char *)malloc(memSize);
    char* placeholder = GeneratePlaceholder();
    for (int i = 0; i < memSize - PLACEHOLDER_LEN; i += PLACEHOLDER_LEN){
        memcpy(memory + i, placeholder, PLACEHOLDER_LEN);
    }
    free(placeholder);
    printf("Alloc %d bytes memory\n", memSize);
}


char* GeneratePlaceholder(){
    char* placeholderzygote = PLACEHOLDERZYGOTE;
    char* placeholder = malloc(PLACEHOLDER_LEN);
    for (int i = 0; i < PLACEHOLDER_LEN / strlen(placeholderzygote); i++){
        strcat(placeholder, placeholderzygote);
    }
    return placeholder;
}


int main(int argc, char* argv[]){
    struct timeval tv, endtv;
    long startTime, endTime;
    int allocMemSize;
    gettimeofday(&tv, NULL);
    if(argc < 2){
        printf("{\"error\": \"Wrong argc %d\"}", argc);
        return -1;
    }
    allocMemSize = atoi(argv[1]);
    AllocMem(allocMemSize);
    gettimeofday(&endtv, NULL);
    startTime = tv.tv_sec * 1000 + tv.tv_usec / 1000;
    endTime = endtv.tv_sec * 1000 + endtv.tv_usec / 1000;
    printf(
        "{\n" 
        "   \"startTime\": %ld,\n"
        "   \"execTime\": %ld\n"
        "}\n", 
        startTime,
        endTime - startTime
    );
    return 0;
}

