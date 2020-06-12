CC=gcc
CFLAGS=-I.
DEPS=hellomake.h

%.o: %.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

hellomake: hellomake.o hellofunc.o
	$(CC) -o hellomake hellomake.o hellofunc.o

hello:
	gcc -o hello hello.c

clean:
	rm -f *.o hello hellomake
