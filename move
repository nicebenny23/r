using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class move : MonoBehaviour
{
    public Rigidbody2D rb;
    public float d;
    public Collider2D[] collide;
    public bool grounded;
    public LayerMask ground;
    public Vector2 jsize;
    public Transform Startp;
    public Transform Endp;
    public float speed;
    // Start is called before the first frame update
    void Start()
    {
        
    }
    private void FixedUpdate()
    {
        grounded = false;
        collide = Physics2D.OverlapBoxAll(transform.position-new Vector3(0,433/1500f),jsize,0,ground);
        for (int i = 0; i < collide.Length; i++)
        {
            if (collide[i].gameObject != gameObject)
            {
                grounded = true;
            }
            else
            {
                grounded = false;
            }
        }
    }
    // Update is called once per frame
    void Update()
    {
        Debug.DrawRay(transform.position - new Vector3(0, .29f), Vector2.down);
      d = Input.GetAxis("Horizontal");
       rb.velocity =Vector2.right*d/speed;
    }
}
