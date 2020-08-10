/* * Copyright (c) 2020 Institution of Parallel and Distributed System, Shanghai Jiao Tong University
 * ServerlessBench is licensed under the Mulan PSL v1.
 * You can use this software according to the terms and conditions of the Mulan PSL v1.
 * You may obtain a copy of Mulan PSL v1 at:
 *     http://license.coscl.org.cn/MulanPSL
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v1 for more details.
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <primesieve.h>

uint64_t gcd(uint64_t a, uint64_t b);
uint64_t RandomPrime();

int main()
{
    struct timeval tv;
    gettimeofday(&tv,NULL);
    srand(time(0));
    uint64_t nth, random, d, e, n, euler_n; 
    uint64_t p = RandomPrime();
    uint64_t q = RandomPrime();

    n = p * q;

    euler_n = (p-1)*(q-1);

    for (e = 2; e < UINT64_MAX; e++) {
        e = (uint64_t)e;
        if (gcd(e, euler_n) == 1) {
            printf("e           = %llu\n", e);
            break;
        }
    }

    for (d = 2; d < UINT64_MAX; d++) {
        if ((((d*e) % euler_n) == 1) && (d != e)) {
            printf("d           = %llu\n", d);
            break;
        }
    }

    // Print public and private key pairs
    printf("Pub key pair <e,n>: <%llu,%llu>\n", e, n);
    printf("Prv key pair <d,n>: <%llu,%llu>\n\n", d, n);
    printf("{	\"pub_key\": \"<%llu,%llu>\", \"pri_key\": \"<%llu,%llu>\",\"startTime\": %ld}",
           e,n,d,n, tv.tv_sec * 1000 + tv.tv_usec / 1000);
    return EXIT_SUCCESS;
}

uint64_t gcd(uint64_t a, uint64_t b) {
    if (b == 0) {
        return a;
    }

    return gcd(b, a % b);
}

uint64_t RandomPrime(){
    return primesieve_nth_prime(rand() % 1000, 2);
}
