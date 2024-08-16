package uk.ac.leedsbeckett.albertarkaa.superbackend.util;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

// This class is used to generate UUIDs for the entities in the application
public class TimeBasedUUIDGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        long time = Instant.now().toEpochMilli();
        UUID randomUUID = UUID.randomUUID();

        long most64SigBits = time & 0xFFFFFFFFFFFF0000L | (randomUUID.getMostSignificantBits() & 0x000000000000FFFFL);
        long least64SigBits = randomUUID.getLeastSignificantBits();

        return new UUID(most64SigBits, least64SigBits).toString();
    }
}