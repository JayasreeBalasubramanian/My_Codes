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

void display(NODE *l) {
    while(l) {
        printf("%5d", l->data);
        l = l->next;
    }
}
NODE *insort(NODE *l,int data)
{
    if(!l)
        return makenode(data,l);
    if(l->data>data)
    {
        NODE *t=makenode(data,l);
        return t;
    }
    l->next=insort(l->next,data);
    return l;
}
NODE *delsort(NODE *l,int data)
{
    if(!l)
        return l;
    if(l->data==data)
    {
        return l->next;
    }
    l->next=delsort(l->next,data);
    return l;
}

int main() {
NODE *l1 = makenode(100);

    printf("\nList 1 : ");
    display(l1);
    printf("\n\n");
    printf("\nList 2 : ");
    display(l2);
    printf("\n\n");
    l3 = insertHead(l3, 2000);
    printf("\nList 3 : ");
    display(l3);
    printf("\n\n");
    printf("\nList 1 after deleting element : ");
    l1=delsort(l1,500);
    display(l1);
}
