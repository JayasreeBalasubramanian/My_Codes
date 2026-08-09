#include <stdio.h>
#include <malloc.h>

typedef struct node {
    int data;
    struct node *next;
} NODE;

NODE *makenode(int data,NODE *next) {
    NODE *temp = (NODE *)malloc(sizeof(NODE));
    temp->data = data;
    temp->next = next;
    return temp;
}
NODE *insertcir(NODE *l, int data) {
    if (!l) {
        NODE *t = makenode(data, NULL);
        t->next = t;
        return t;
    }
    NODE *current = l;
    while (current->next != l) {
        current = current->next;
    }
    NODE *temp = makenode(data, l);
    current->next = temp;
    return l;
}
void dcir(NODE *l) {
    if (!l) return;

    NODE *t = l;
    printf("%5d", t->data);
    t = t->next;
    while (t != l) {
        printf("%5d", t->data);
        t = t->next;
    }
}
int main() {
   NODE *l = NULL;
    l = insertcir(l, 200);
    l = insertcir(l, 300);
    l = insertcir(l, 400);

    printf("\nCircular List: ");
    dcir(l);
    printf("\n\n");
    return 0;
}
