package com.gerement.gestion_evenements.exception;

public class EvenementNotFoundException  extends RuntimeException {
    public EvenementNotFoundException(String message) {
        super(message);
    }
}
